import { screenShareService } from '../services/screenShareService.js';

export const startPresentation = async (req, res, next) => {
  try {
    const {
      roomId,
      roomName,
      presenterId,
      presenterName,
      resolution,
      maxBitrateKbps,
      hasAudio,
    } = req.body;

    if (!roomId || !presenterId || !presenterName) {
      return res
        .status(400)
        .json({ error: 'roomId, presenterId, and presenterName are required' });
    }

    const session = await screenShareService.startSession({
      roomId,
      roomName,
      presenterId,
      presenterName,
      resolution,
      maxBitrateKbps,
      hasAudio,
    });

    return res.status(201).json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

export const stopPresentation = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { requesterId } = req.body;

    if (!requesterId) {
      return res.status(400).json({ error: 'requesterId is required' });
    }

    const session = await screenShareService.stopSession(sessionId, requesterId);
    return res.json({ success: true, session });
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
};

export const addViewerToSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { userId, userName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const session = await screenShareService.addViewer(sessionId, { userId, userName });
    return res.json({ success: true, session });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

export const adaptSessionBitrate = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { resolution, bitrateKbps, reason } = req.body;

    const session = await screenShareService.adaptBitrate(sessionId, {
      resolution,
      bitrateKbps,
      reason,
    });
    return res.json({ success: true, session });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

export const getActiveInRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const session = await screenShareService.getActiveSessionInRoom(roomId);
    return res.json({ success: true, hasActivePresentation: !!session, session });
  } catch (err) {
    next(err);
  }
};

export const getAllActive = async (req, res, next) => {
  try {
    const sessions = await screenShareService.getAllActiveSessions();
    return res.json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    next(err);
  }
};
