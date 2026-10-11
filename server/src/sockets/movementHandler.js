import { presenceService } from '../services/presenceService.js';
import { proximityService } from '../services/proximityService.js';
import { officeService } from '../services/officeService.js';
import { isPointInBox } from '../utils/distance.js';

export const registerMovementHandlers = (io, socket) => {
  socket.on('move', async ({ x, y, orientation = 'down' }) => {
    try {
      const mapping = presenceService.socketMap.get(socket.id);
      if (!mapping) return;

      const { officeId, userId } = mapping;
      const office = await officeService.getOfficeBySlug('infotact-hq');

      // 1. Boundary clamping
      const maxWidth = office?.width || 1600;
      const maxHeight = office?.height || 1000;
      const avatarRadius = 16;

      const clampedX = Math.max(avatarRadius, Math.min(maxWidth - avatarRadius, x));
      const clampedY = Math.max(avatarRadius, Math.min(maxHeight - avatarRadius, y));

      // 2. Obstacle collision detection
      let finalX = clampedX;
      let finalY = clampedY;

      if (office && office.obstacles) {
        for (const obs of office.obstacles) {
          if (obs.blocksMovement) {
            // Expand box by avatar radius for simple circle-box collision
            const expandedBox = {
              x: obs.x - avatarRadius,
              y: obs.y - avatarRadius,
              width: obs.width + avatarRadius * 2,
              height: obs.height + avatarRadius * 2,
            };

            if (isPointInBox({ x: finalX, y: finalY }, expandedBox)) {
              // Colliding with solid obstacle - reject invalid move inside obstacle
              // Allow sliding along open axis if previous position exists
              const prev = presenceService.getUserBySocket(socket.id);
              if (prev) {
                if (!isPointInBox({ x: clampedX, y: prev.y }, expandedBox)) {
                  finalY = prev.y;
                } else if (!isPointInBox({ x: prev.x, y: clampedY }, expandedBox)) {
                  finalX = prev.x;
                } else {
                  finalX = prev.x;
                  finalY = prev.y;
                }
              }
              break;
            }
          }
        }
      }

      // 3. Update position in presence service
      const updated = presenceService.updatePosition(socket.id, {
        x: finalX,
        y: finalY,
        orientation,
      });

      if (!updated) return;

      const { user } = updated;

      // 4. Broadcast updated position to office peers
      socket.to(officeId).emit('user-moved', {
        userId,
        socketId: socket.id,
        x: finalX,
        y: finalY,
        orientation,
      });

      // 5. Evaluate Proximity & WebRTC Connection States
      const allOfficeUsers = presenceService.getOfficeUsers(officeId);
      const proximityResult = proximityService.calculateProximityDeltas({
        currentUser: user,
        otherUsers: allOfficeUsers,
        previousNearbyIds: socket.connectedPeers || new Set(),
        obstacles: office?.obstacles || [],
      });

      // Update socket's set of connected peers
      socket.connectedPeers = proximityResult.currentNearbyIds;

      // Notify newly entered proximity peers (establish WebRTC)
      for (const peer of proximityResult.enteredProximity) {
        // Deterministic initiator logic: lowest ID initiates
        const isSelfInitiator = userId < peer.userId;

        socket.emit('peer-entered-proximity', {
          peer,
          isInitiator: isSelfInitiator,
        });

        io.to(peer.socketId).emit('peer-entered-proximity', {
          peer: {
            userId: user.userId,
            socketId: socket.id,
            displayName: user.displayName,
            distance: peer.distance,
            attenuation: peer.attenuation,
            pan: -peer.pan, // Invert stereo panning for counterpart
            isMuted: user.isMuted,
            isSpeaking: user.isSpeaking,
          },
          isInitiator: !isSelfInitiator,
        });
      }

      // Notify exited proximity peers (tear down / mute WebRTC)
      for (const peer of proximityResult.exitedProximity) {
        socket.emit('peer-exited-proximity', {
          userId: peer.userId,
          distance: peer.distance,
        });

        io.to(peer.socketId).emit('peer-exited-proximity', {
          userId,
          distance: peer.distance,
        });
      }

      // Send live dynamic audio attenuation & panning updates
      socket.emit('proximity-update', {
        nearbyPeers: proximityResult.nearbyPeers,
      });

      // Also send reciprocal update to each nearby peer so their local audio mixer adjusts
      for (const peer of proximityResult.nearbyPeers) {
        io.to(peer.socketId).emit('peer-spatial-update', {
          peerId: userId,
          distance: peer.distance,
          attenuation: peer.attenuation,
          pan: -peer.pan,
        });
      }
    } catch (err) {
      console.error('[Movement] Error handling move:', err);
    }
  });
};
