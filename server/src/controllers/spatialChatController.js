import { SpatialMessage } from '../models/SpatialMessage.js';
import { getRecentMessagesForZone } from '../services/spatialChatService.js';

export const getZoneMessages = async (req, res, next) => {
  try {
    const { zone } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;
    const messages = await getRecentMessagesForZone(zone, limit);
    return res.json({
      success: true,
      zone,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

export const getNearbyMessages = async (req, res, next) => {
  try {
    const { x, y, radius = 160 } = req.query;
    if (x === undefined || y === undefined) {
      return res.status(400).json({ error: 'Coordinates x and y are required' });
    }

    const posX = parseFloat(x);
    const posY = parseFloat(y);
    const rad = parseFloat(radius);

    // Search recent messages within bounding box / distance
    let messages = [];
    try {
      if (SpatialMessage.db?.readyState === 1) {
        messages = await SpatialMessage.find({
          x: { $gte: posX - rad, $lte: posX + rad },
          y: { $gte: posY - rad, $lte: posY + rad },
        })
          .sort({ createdAt: -1 })
          .limit(50);
      }
    } catch (e) {
      // fallback
    }

    return res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

export const getChatStats = async (req, res, next) => {
  try {
    let totalMessages = 0;
    try {
      if (SpatialMessage.db?.readyState === 1) {
        totalMessages = await SpatialMessage.countDocuments();
      }
    } catch (e) {}

    return res.json({
      success: true,
      service: 'ProxiSpeak Spatial In-Earshot Chat',
      ttlSeconds: 600,
      totalActiveEphemeralMessages: totalMessages,
      acousticIsolationZones: [
        'Executive Glass Boardroom',
        'Focus Cabin Alpha',
        'Focus Cabin Beta',
      ],
    });
  } catch (err) {
    next(err);
  }
};
