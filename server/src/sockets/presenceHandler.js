import { presenceService } from '../services/presenceService.js';
import { officeService } from '../services/officeService.js';
import { proximityService } from '../services/proximityService.js';
import { User } from '../models/User.js';

export const registerPresenceHandlers = (io, socket) => {
  // Store connected peers set on socket for proximity tracking
  socket.connectedPeers = new Set();
  socket.currentOfficeId = null;

  // Join a virtual office
  socket.on('join-office', async ({ officeSlug = 'infotact-hq', x, y }, callback) => {
    try {
      const office = await officeService.getOfficeBySlug(officeSlug);
      if (!office) {
        if (typeof callback === 'function') callback({ success: false, message: 'Office not found' });
        return;
      }

      const officeId = office._id ? office._id.toString() : office.id || 'default_office';
      socket.currentOfficeId = officeId;
      socket.join(officeId);

      const spawnX = typeof x === 'number' ? x : office.spawnPoint?.x ?? 250;
      const spawnY = typeof y === 'number' ? y : office.spawnPoint?.y ?? 250;

      const userState = presenceService.addOrUpdateUser(officeId, {
        userId: socket.user.id,
        socketId: socket.id,
        username: socket.user.username,
        displayName: socket.user.displayName || socket.user.username,
        avatarColor: socket.user.avatarColor || '#3B82F6',
        avatarShape: socket.user.avatarShape || 'circle',
        x: spawnX,
        y: spawnY,
        orientation: 'down',
        isMuted: false,
        isSpeaking: false,
      });

      // Update online status in database if registered user
      if (!socket.user.isGuest) {
        User.findByIdAndUpdate(socket.user.id, {
          isOnline: true,
          lastSeen: new Date(),
          'lastPosition.officeId': office._id,
          'lastPosition.x': spawnX,
          'lastPosition.y': spawnY,
          location: { type: 'Point', coordinates: [spawnX, spawnY] },
        }).catch((err) => console.warn('[Presence] DB update notice:', err.message));
      }

      // Fetch all existing users in the office
      const allOfficeUsers = presenceService.getOfficeUsers(officeId);

      // Compute initial proximity
      const proximityResult = proximityService.calculateProximityDeltas({
        currentUser: userState,
        otherUsers: allOfficeUsers,
        previousNearbyIds: socket.connectedPeers,
        obstacles: office.obstacles || [],
      });

      // Update connected peers
      socket.connectedPeers = proximityResult.currentNearbyIds;

      // Broadcast new user to everyone else in this office
      socket.to(officeId).emit('user-joined', {
        user: userState,
      });

      // For every peer in initial proximity, notify both peers to start WebRTC handshake
      for (const peer of proximityResult.enteredProximity) {
        // Send signal to initiate peer connection
        socket.emit('peer-entered-proximity', {
          peer,
          isInitiator: socket.user.id < peer.userId,
        });

        io.to(peer.socketId).emit('peer-entered-proximity', {
          peer: {
            userId: userState.userId,
            socketId: socket.id,
            displayName: userState.displayName,
            distance: peer.distance,
            attenuation: peer.attenuation,
            pan: -peer.pan, // Opposite stereo side for the other user!
            isMuted: userState.isMuted,
            isSpeaking: userState.isSpeaking,
          },
          isInitiator: peer.userId < socket.user.id,
        });
      }

      if (typeof callback === 'function') {
        callback({
          success: true,
          office,
          currentUser: userState,
          users: allOfficeUsers,
          nearbyPeers: proximityResult.nearbyPeers,
        });
      }
    } catch (err) {
      console.error('[Presence] Error joining office:', err);
      if (typeof callback === 'function') {
        callback({ success: false, message: err.message });
      }
    }
  });

  // Toggle microphone mute state
  socket.on('toggle-mute', ({ isMuted }) => {
    const updated = presenceService.updateAudioState(socket.id, { isMuted });
    if (updated) {
      io.to(updated.officeId).emit('user-audio-state-changed', {
        userId: socket.user.id,
        isMuted,
        isSpeaking: updated.user.isSpeaking,
      });
    }
  });

  // Voice activity indicator (speaking or silent)
  socket.on('speaking-state', ({ isSpeaking }) => {
    const updated = presenceService.updateAudioState(socket.id, { isSpeaking });
    if (updated) {
      io.to(updated.officeId).emit('user-speaking-changed', {
        userId: socket.user.id,
        isSpeaking,
      });
    }
  });

  // Disconnect cleanup
  socket.on('disconnect', () => {
    const removed = presenceService.removeUser(socket.id);
    if (removed) {
      const { officeId, user } = removed;
      // Notify office peers that this user left
      io.to(officeId).emit('user-left', {
        userId: user.userId,
        socketId: socket.id,
      });

      // Notify any previously connected WebRTC proximity peers to tear down audio
      if (socket.connectedPeers) {
        for (const peerId of socket.connectedPeers) {
          socket.to(officeId).emit('peer-exited-proximity', {
            userId: user.userId,
          });
        }
      }

      if (!socket.user?.isGuest && user.userId) {
        User.findByIdAndUpdate(user.userId, {
          isOnline: false,
          lastSeen: new Date(),
        }).catch(() => {});
      }
    }
  });
};
