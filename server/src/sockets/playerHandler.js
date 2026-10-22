import { presenceService } from '../services/presenceService.js';
import { User } from '../models/User.js';

const DEFAULT_OFFICE_ID = 'default_office';
const HEARING_RADIUS = 100;

// Set of socket IDs that have activated voice
const voiceActiveSockets = new Set();

/**
 * Register handlers for direct interactive canvas client (ProxiSpeak Week 1-4 UI)
 */
export const registerPlayerHandlers = (io, socket) => {
  const initialName = socket.user?.displayName || socket.user?.username || `User-${socket.id.slice(0, 4)}`;
  const initialColor = socket.user?.avatarColor || '#2563eb';

  // 1. Initialize user presence
  const user = {
    id: socket.id,
    name: initialName,
    color: initialColor,
    x: 180,
    y: 180,
    isSpeaking: false,
  };

  presenceService.addOrUpdateUser(DEFAULT_OFFICE_ID, {
    userId: socket.id,
    socketId: socket.id,
    username: user.name,
    displayName: user.name,
    avatarColor: user.color,
    x: user.x,
    y: user.y,
    isSpeaking: false,
  });

  const sendProximityTo = (targetSocket) => {
    const allUsers = presenceService.getOfficeUsers(DEFAULT_OFFICE_ID);
    const selfPresence = presenceService.getUserBySocket(targetSocket.id);
    if (!selfPresence) return;

    const nearby = allUsers
      .filter((u) => u.socketId !== targetSocket.id)
      .map((u) => ({
        id: u.socketId,
        name: u.displayName || u.username,
        color: u.avatarColor || '#2563eb',
        isSpeaking: Boolean(u.isSpeaking),
        distance: Math.round(Math.hypot(selfPresence.x - u.x, selfPresence.y - u.y)),
      }))
      .filter((u) => u.distance <= HEARING_RADIUS);

    targetSocket.emit('proximity:update', nearby);
  };

  const refreshAllProximity = () => {
    for (const [id, s] of io.sockets.sockets) {
      sendProximityTo(s);
    }
  };

  // Broadcast initial roster to current socket
  const allUsers = presenceService.getOfficeUsers(DEFAULT_OFFICE_ID);
  const formattedUsers = allUsers.map((u) => ({
    id: u.socketId,
    name: u.displayName || u.username,
    color: u.avatarColor || '#2563eb',
    x: u.x,
    y: u.y,
    isSpeaking: Boolean(u.isSpeaking),
  }));

  socket.emit('users:update', formattedUsers);
  socket.broadcast.emit('user:joined', user);
  refreshAllProximity();

  // 2. Avatar Movement
  socket.on('player:move', (pos) => {
    if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
    const clampedX = Math.max(16, Math.min(884, pos.x));
    const clampedY = Math.max(16, Math.min(484, pos.y));

    user.x = clampedX;
    user.y = clampedY;
    presenceService.updatePosition(socket.id, { x: clampedX, y: clampedY });

    socket.broadcast.emit('player:moved', { id: socket.id, x: clampedX, y: clampedY });
    refreshAllProximity();

    // Persist position if registered user
    if (!socket.user?.isGuest) {
      User.findByIdAndUpdate(socket.user.id, {
        lastSeen: new Date(),
        'lastPosition.x': clampedX,
        'lastPosition.y': clampedY,
        location: { type: 'Point', coordinates: [clampedX, clampedY] },
      }).catch(() => {});
    }
  });

  // 3. Profile Updates (Name & Color)
  socket.on('player:update-profile', ({ name, color }) => {
    if (name && typeof name === 'string') user.name = name.trim().slice(0, 24);
    if (color && typeof color === 'string') user.color = color;

    presenceService.addOrUpdateUser(DEFAULT_OFFICE_ID, {
      userId: socket.id,
      socketId: socket.id,
      displayName: user.name,
      avatarColor: user.color,
    });

    io.emit('player:profile-updated', { id: socket.id, name: user.name, color: user.color });
    refreshAllProximity();
  });

  // 4. Floating Emoji Reaction
  socket.on('player:reaction', ({ emoji }) => {
    if (emoji && typeof emoji === 'string') {
      io.emit('player:reaction', { id: socket.id, emoji: emoji.slice(0, 4) });
    }
  });

  // 5. Voice Activity Detection (Speaking state)
  socket.on('player:speaking', ({ isSpeaking }) => {
    user.isSpeaking = Boolean(isSpeaking);
    presenceService.updateAudioState(socket.id, { isSpeaking: user.isSpeaking });
    socket.broadcast.emit('player:speaking-changed', { id: socket.id, isSpeaking: user.isSpeaking });
  });

  // 6. Voice Ready / Stop signaling
  socket.on('voice:ready', () => {
    socket.emit('voice:ready-users', [...voiceActiveSockets].filter((id) => id !== socket.id));
    voiceActiveSockets.add(socket.id);
    socket.broadcast.emit('voice:user-ready', { id: socket.id });
  });

  socket.on('voice:stop', () => {
    voiceActiveSockets.delete(socket.id);
    socket.broadcast.emit('voice:user-stopped', { id: socket.id });
  });

  // 7. WebRTC Peer Signal Forwarding
  const forwardSignal = (eventName, payload) => {
    if (!payload || typeof payload.to !== 'string') return;
    const forwarded = { from: socket.id };
    if (payload.description) forwarded.description = payload.description;
    if (payload.candidate) forwarded.candidate = payload.candidate;
    io.to(payload.to).emit(eventName, forwarded);
  };

  socket.on('webrtc:offer', (payload) => forwardSignal('webrtc:offer', payload));
  socket.on('webrtc:answer', (payload) => forwardSignal('webrtc:answer', payload));
  socket.on('webrtc:ice-candidate', (payload) => forwardSignal('webrtc:ice-candidate', payload));

  // 8. Disconnect Cleanup
  socket.on('disconnect', () => {
    voiceActiveSockets.delete(socket.id);
    presenceService.removeUser(socket.id);
    socket.broadcast.emit('voice:user-stopped', { id: socket.id });
    refreshAllProximity();
    io.emit('user:left', socket.id);
  });
};
