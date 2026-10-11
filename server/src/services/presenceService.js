/**
 * PresenceService manages active real-time avatar states per office
 */

class PresenceService {
  constructor() {
    // Map of officeId -> Map<userId, UserState>
    this.offices = new Map();
    // Map of socketId -> { userId, officeId }
    this.socketMap = new Map();
  }

  getOfficeMap(officeId) {
    if (!this.offices.has(officeId)) {
      this.offices.set(officeId, new Map());
    }
    return this.offices.get(officeId);
  }

  addOrUpdateUser(officeId, user) {
    const officeUsers = this.getOfficeMap(officeId);
    const existing = officeUsers.get(user.userId) || {};

    const updatedUser = {
      ...existing,
      ...user,
      x: typeof user.x === 'number' ? user.x : existing.x ?? 200,
      y: typeof user.y === 'number' ? user.y : existing.y ?? 200,
      isMuted: typeof user.isMuted === 'boolean' ? user.isMuted : existing.isMuted ?? false,
      isSpeaking: typeof user.isSpeaking === 'boolean' ? user.isSpeaking : existing.isSpeaking ?? false,
      lastUpdated: Date.now(),
    };

    officeUsers.set(user.userId, updatedUser);
    this.socketMap.set(user.socketId, { userId: user.userId, officeId });
    return updatedUser;
  }

  updatePosition(socketId, { x, y, orientation = 'down' }) {
    const mapping = this.socketMap.get(socketId);
    if (!mapping) return null;

    const { officeId, userId } = mapping;
    const officeUsers = this.offices.get(officeId);
    if (!officeUsers) return null;

    const user = officeUsers.get(userId);
    if (!user) return null;

    user.x = x;
    user.y = y;
    user.orientation = orientation;
    user.lastUpdated = Date.now();
    return { officeId, user };
  }

  updateAudioState(socketId, { isMuted, isSpeaking }) {
    const mapping = this.socketMap.get(socketId);
    if (!mapping) return null;

    const { officeId, userId } = mapping;
    const officeUsers = this.offices.get(officeId);
    if (!officeUsers) return null;

    const user = officeUsers.get(userId);
    if (!user) return null;

    if (typeof isMuted === 'boolean') user.isMuted = isMuted;
    if (typeof isSpeaking === 'boolean') user.isSpeaking = isSpeaking;
    return { officeId, user };
  }

  removeUser(socketId) {
    const mapping = this.socketMap.get(socketId);
    if (!mapping) return null;

    const { officeId, userId } = mapping;
    this.socketMap.delete(socketId);

    const officeUsers = this.offices.get(officeId);
    if (!officeUsers) return null;

    const removedUser = officeUsers.get(userId);
    officeUsers.delete(userId);

    if (officeUsers.size === 0) {
      this.offices.delete(officeId);
    }

    return { officeId, user: removedUser };
  }

  getOfficeUsers(officeId) {
    const officeUsers = this.offices.get(officeId);
    if (!officeUsers) return [];
    return Array.from(officeUsers.values());
  }

  getUserBySocket(socketId) {
    const mapping = this.socketMap.get(socketId);
    if (!mapping) return null;
    const officeUsers = this.offices.get(mapping.officeId);
    return officeUsers ? officeUsers.get(mapping.userId) : null;
  }
}

export const presenceService = new PresenceService();
