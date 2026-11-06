import express from 'express';
import {
  recordTelemetry,
  getMeshTopology,
  getZoneDiagnostics,
} from '../controllers/meshDiagnosticsController.js';

const router = express.Router();

router.post('/telemetry', recordTelemetry);
router.get('/topology', getMeshTopology);
router.get('/zone/:zone', getZoneDiagnostics);

export default router;
