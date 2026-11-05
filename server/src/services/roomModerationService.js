/**
 * ProxiSpeak Week 4 — Room Moderation & Host Access Control (RBAC) Service
 * Author: Koneti Manikanth <manikanth9878@gmail.com>
 *
 * Provides host moderation capabilities for private acoustic rooms on Floor 4
 * (Executive Glass Boardroom, Focus Cabins). Allows room owners to enforce
 * soundproof privacy locks, mute all participants during presentations, and
 * eject non-compliant attendees back to the Reception Lobby.
 */

class RoomModerationService {
  constructor() {
    // Map of roomId -> { hostId, hostName, isLocked, auditLogs: [] }
    this.roomStates = new Map();
  }

  _getRoom(roomId) {
    if (!this.roomStates.has(roomId)) {
      this.roomStates.set(roomId, {
        roomId,
        hostId: null,
        hostName: null,
        isLocked: false,
        auditLogs: [],
      });
    }
    return this.roomStates.get(roomId);
  }

  /**
   * Assign or claim room host role
   */
  claimHost(roomId, userId, userName = "Room Host") {
    const room = this._getRoom(roomId);
    if (!room.hostId || room.hostId === userId) {
      room.hostId = userId;
      room.hostName = userName;
      room.auditLogs.push({
        action: "HOST_CLAIMED",
        actorId: userId,
        actorName: userName,
        timestamp: new Date(),
      });
      return { success: true, hostId: userId, hostName: userName };
    }
    return { success: false, message: `Room already has an active host: ${room.hostName}` };
  }

  /**
   * Verify if a user is the authorized host/moderator of a room
   */
  isHost(roomId, userId) {
    const room = this._getRoom(roomId);
    return room.hostId === userId;
  }

  /**
   * Mute all non-host attendees inside the acoustic meeting room
   */
  muteAllParticipants(roomId, requesterId, participants = []) {
    const room = this._getRoom(roomId);
    if (!this.isHost(roomId, requesterId)) {
      throw new Error(`Unauthorized: Only the room host (${room.hostName}) can mute all attendees.`);
    }

    const mutedPeerIds = [];
    for (const peer of participants) {
      if (peer.id !== requesterId) {
        mutedPeerIds.push(peer.id);
      }
    }

    room.auditLogs.push({
      action: "MUTE_ALL",
      actorId: requesterId,
      affectedCount: mutedPeerIds.length,
      timestamp: new Date(),
    });

    return {
      success: true,
      roomId,
      mutedPeerIds,
      count: mutedPeerIds.length,
    };
  }

  /**
   * Eject an attendee from the private room back to the Reception Lobby
   */
  kickParticipant(roomId, requesterId, targetPeerId) {
    const room = this._getRoom(roomId);
    if (!this.isHost(roomId, requesterId)) {
      throw new Error("Unauthorized: Only the room host can eject participants.");
    }

    if (targetPeerId === requesterId) {
      throw new Error("Host cannot kick themselves from their own room.");
    }

    room.auditLogs.push({
      action: "PARTICIPANT_KICKED",
      actorId: requesterId,
      targetId: targetPeerId,
      timestamp: new Date(),
    });

    return {
      success: true,
      roomId,
      targetPeerId,
      relocateTo: {
        zone: "Modern Reception Lobby",
        x: 220,
        y: 190,
      },
    };
  }

  /**
   * Toggle confidential soundproof isolation lock
   */
  toggleRoomLock(roomId, requesterId) {
    const room = this._getRoom(roomId);
    if (!this.isHost(roomId, requesterId)) {
      throw new Error("Unauthorized: Only the room host can toggle the privacy lock.");
    }

    room.isLocked = !room.isLocked;
    room.auditLogs.push({
      action: room.isLocked ? "ROOM_LOCKED" : "ROOM_UNLOCKED",
      actorId: requesterId,
      timestamp: new Date(),
    });

    return {
      success: true,
      roomId,
      isLocked: room.isLocked,
    };
  }

  /**
   * Get current moderation status and recent audit log entries
   */
  getStatus(roomId) {
    const room = this._getRoom(roomId);
    return {
      roomId: room.roomId,
      hostId: room.hostId,
      hostName: room.hostName,
      isLocked: room.isLocked,
      auditHistoryCount: room.auditLogs.length,
      recentAuditLogs: room.auditLogs.slice(-5),
    };
  }

  clear() {
    this.roomStates.clear();
  }
}

export const roomModerationService = new RoomModerationService();
