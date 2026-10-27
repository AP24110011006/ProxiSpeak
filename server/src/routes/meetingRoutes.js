import express from "express";
import {
  getMeetingRooms,
  toggleRoomLock,
  getAcousticIsolation,
  startRoomRecording,
  stopRoomRecording,
  getRoomRecordingStatus,
} from "../controllers/meetingController.js";

const router = express.Router();

// GET /api/rooms - List all rooms and their acoustic/privacy state
router.get("/", getMeetingRooms);

// POST /api/rooms/:roomId/lock - Toggle room privacy & soundproof isolation
router.post("/:roomId/lock", toggleRoomLock);

// GET /api/rooms/isolation - Compute isolation factor between two positions
router.get("/isolation", getAcousticIsolation);

// POST /api/rooms/:roomId/recording/start - Start room audio recording session
router.post("/:roomId/recording/start", startRoomRecording);

// POST /api/rooms/:roomId/recording/stop - Stop room audio recording session
router.post("/:roomId/recording/stop", stopRoomRecording);

// GET /api/rooms/:roomId/recording - Get room recording status & history
router.get("/:roomId/recording", getRoomRecordingStatus);

export default router;
