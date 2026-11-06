import { meshDiagnosticsService } from '../services/meshDiagnosticsService.js';

export const recordTelemetry = (req, res, next) => {
  try {
    const { fromId, toId, rttMs, jitterMs, packetLoss, bitrateKbps, zone } = req.body;
    if (!fromId || !toId) {
      return res.status(400).json({ error: 'fromId and toId are required' });
    }
    const record = meshDiagnosticsService.recordPeerTelemetry({
      fromId,
      toId,
      rttMs,
      jitterMs,
      packetLoss,
      bitrateKbps,
      zone,
    });
    return res.json({ success: true, record });
  } catch (err) {
    next(err);
  }
};

export const getMeshTopology = (req, res, next) => {
  try {
    const report = meshDiagnosticsService.getAggregateMeshHealth();
    return res.json({ success: true, ...report });
  } catch (err) {
    next(err);
  }
};

export const getZoneDiagnostics = (req, res, next) => {
  try {
    const { zone } = req.params;
    const records = meshDiagnosticsService.getZoneTelemetry(zone);
    return res.json({ success: true, zone, count: records.length, records });
  } catch (err) {
    next(err);
  }
};
