import express from "express";
import {
  getMeshHealth,
  getAllPeerStats,
  reportPeerStats,
} from "../controllers/metricsController.js";

const router = express.Router();

// GET /api/metrics/audio - Live WebRTC mesh latency, jitter, and codec health
router.get("/audio", getMeshHealth);

// GET /api/metrics/mesh - Alias for audio mesh health
router.get("/mesh", getMeshHealth);

// GET /api/metrics/peers - Detailed list of individual peer connection stats
router.get("/peers", getAllPeerStats);

// POST /api/metrics/report - Ingest peer getStats() telemetry from client
router.post("/report", reportPeerStats);

export default router;
