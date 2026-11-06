import { roomModerationService } from '../services/roomModerationService.js';

export const getRoomStatus = (req, res, next) => {
  try {
    const { roomId } = req.params;
    const status = roomModerationService.getStatus(roomId);
    return res.json({ success: true, ...status });
  } catch (err) {
    next(err);
  }
};

export const claimHostRole = (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { userId, userName } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const result = roomModerationService.claimHost(roomId, userId, userName);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const muteAllInRoom = (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { requesterId, participants = [] } = req.body;
    if (!requesterId) {
      return res.status(400).json({ error: 'requesterId is required' });
    }
    const result = roomModerationService.muteAllParticipants(roomId, requesterId, participants);
    return res.json(result);
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
};

export const kickParticipant = (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { requesterId, targetPeerId } = req.body;
    if (!requesterId || !targetPeerId) {
      return res.status(400).json({ error: 'requesterId and targetPeerId are required' });
    }
    const result = roomModerationService.kickParticipant(roomId, requesterId, targetPeerId);
    return res.json(result);
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
};

export const togglePrivacyLock = (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { requesterId } = req.body;
    if (!requesterId) {
      return res.status(400).json({ error: 'requesterId is required' });
    }
    const result = roomModerationService.toggleRoomLock(roomId, requesterId);
    return res.json(result);
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
};
