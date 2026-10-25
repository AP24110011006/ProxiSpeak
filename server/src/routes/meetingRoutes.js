import express from "express";
import {
  getMeetingRooms,
  toggleRoomLock,
  getAcousticIsolation
} from "../controllers/meetingController.js";

const router = express.Router();

// GET /api/rooms - List all rooms and their acoustic/privacy state
router.get("/", getMeetingRooms);

// POST /api/rooms/:roomId/lock - Toggle room privacy & soundproof isolation
router.post("/:roomId/lock", toggleRoomLock);

// GET /api/rooms/isolation - Compute isolation factor between two positions
router.get("/isolation", getAcousticIsolation);

export default router;
