import express from "express";
import { audioMetricsService } from "../services/audioMetricsService.js";

const router = express.Router();

// GET /api/metrics/audio - Live WebRTC mesh latency and audio health
router.get("/audio", (req, res) => {
  const health = audioMetricsService.getMeshHealth();
  res.status(200).json(health);
});

export default router;
