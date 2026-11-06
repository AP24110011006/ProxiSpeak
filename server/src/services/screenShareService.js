import { ScreenShareSession } from '../models/ScreenShareSession.js';

// In-memory fallback session store for test harnesses and disconnected DB environments
const inMemorySessions = new Map();

class ScreenShareService {
  /**
   * Start a new screen sharing presentation session in a room
   */
  async startSession({
    roomId,
    roomName = 'Executive Glass Boardroom',
    presenterId,
    presenterName,
    resolution = '1080p',
    maxBitrateKbps = 3500,
    hasAudio = true,
  }) {
    const sessionId = `ss-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const sessionData = {
      sessionId,
      roomId,
      roomName,
      presenterId,
      presenterName,
      resolution,
      maxBitrateKbps,
      currentBitrateKbps: maxBitrateKbps,
      hasAudio,
      isActive: true,
      viewers: [],
      bandwidthLadder: [
        {
          timestamp: new Date(),
          resolution,
          bitrateKbps: maxBitrateKbps,
          reason: 'Initial 1080p presentation stream started',
        },
      ],
      startedAt: new Date(),
      endedAt: null,
      totalDurationSeconds: 0,
    };

    inMemorySessions.set(sessionId, sessionData);

    try {
      if (ScreenShareSession.db?.readyState === 1) {
        await ScreenShareSession.create(sessionData);
      }
    } catch (err) {
      // Fallback silently to memory store
    }

    return sessionData;
  }

  /**
   * Add a viewer to the active screen sharing session
   */
  async addViewer(sessionId, { userId, userName }) {
    const session = inMemorySessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Active presentation session not found');
    }

    if (!session.viewers.some((v) => v.userId === userId)) {
      session.viewers.push({ userId, userName, joinedAt: new Date() });
    }

    try {
      if (ScreenShareSession.db?.readyState === 1) {
        await ScreenShareSession.updateOne(
          { sessionId },
          { $addToSet: { viewers: { userId, userName } } }
        );
      }
    } catch (err) {
      // fallback
    }

    return session;
  }

  /**
   * Adapt bitrate and resolution ladder in response to network congestion
   */
  async adaptBitrate(sessionId, { resolution, bitrateKbps, reason }) {
    const session = inMemorySessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Active presentation session not found');
    }

    session.resolution = resolution;
    session.currentBitrateKbps = bitrateKbps;
    session.bandwidthLadder.push({
      timestamp: new Date(),
      resolution,
      bitrateKbps,
      reason: reason || 'Network condition adjustment',
    });

    try {
      if (ScreenShareSession.db?.readyState === 1) {
        await ScreenShareSession.updateOne(
          { sessionId },
          {
            $set: { resolution, currentBitrateKbps: bitrateKbps },
            $push: { bandwidthLadder: { resolution, bitrateKbps, reason } },
          }
        );
      }
    } catch (err) {
      // fallback
    }

    return session;
  }

  /**
   * Stop an active screen sharing presentation session
   */
  async stopSession(sessionId, requesterId) {
    const session = inMemorySessions.get(sessionId);
    if (!session) {
      throw new Error('Presentation session not found');
    }

    if (session.presenterId !== requesterId) {
      throw new Error('Unauthorized: Only the presenter can stop the session');
    }

    session.isActive = false;
    session.endedAt = new Date();
    session.totalDurationSeconds = Math.max(
      1,
      Math.round((session.endedAt.getTime() - new Date(session.startedAt).getTime()) / 1000)
    );

    try {
      if (ScreenShareSession.db?.readyState === 1) {
        await ScreenShareSession.updateOne(
          { sessionId },
          {
            $set: {
              isActive: false,
              endedAt: session.endedAt,
              totalDurationSeconds: session.totalDurationSeconds,
            },
          }
        );
      }
    } catch (err) {
      // fallback
    }

    return session;
  }

  /**
   * Get active presentation in a room
   */
  async getActiveSessionInRoom(roomId) {
    for (const session of inMemorySessions.values()) {
      if (session.roomId === roomId && session.isActive) {
        return session;
      }
    }

    try {
      if (ScreenShareSession.db?.readyState === 1) {
        const found = await ScreenShareSession.findOne({ roomId, isActive: true });
        if (found) return found;
      }
    } catch (err) {
      // fallback
    }

    return null;
  }

  /**
   * List all currently active screen share presentations across the entire office floor
   */
  async getAllActiveSessions() {
    const list = [];
    for (const s of inMemorySessions.values()) {
      if (s.isActive) list.push(s);
    }
    return list;
  }

  clear() {
    inMemorySessions.clear();
  }
}

export const screenShareService = new ScreenShareService();
