import { OfficeLayout, DEFAULT_OFFICE_LAYOUT } from "../models/OfficeLayout.js";
import { roomRecordingService } from "../services/roomRecordingService.js";
import { spatialOcclusionService } from "../services/spatialOcclusionService.js";
import { ambientNoiseService } from "../services/ambientNoiseService.js";

// In-memory state for real-time room privacy locks and settings
const roomSettings = {
  boardroom: { locked: true, soundproofFactor: 0.95, mode: "confidential" },
  focus_cabins: { locked: true, soundproofFactor: 0.98, mode: "private" },
  dev_pods: { locked: false, soundproofFactor: 0.20, mode: "collaborative" },
  reception: { locked: false, soundproofFactor: 0.10, mode: "open" },
  lounge: { locked: false, soundproofFactor: 0.15, mode: "social" }
};

/**
 * Determine which room contains a given coordinate
 */
export function getRoomForCoordinate(x, y) {
  const rooms = DEFAULT_OFFICE_LAYOUT.rooms;
  for (const r of rooms) {
    const b = r.bounds;
    if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
      return r;
    }
  }
  return null;
}

/**
 * Calculate acoustic isolation between listener and speaker
 * Returns isolation score between 0.0 (open air) and 1.0 (complete sound barrier)
 */
export function calculateAcousticIsolation(x1, y1, x2, y2) {
  const room1 = getRoomForCoordinate(x1, y1);
  const room2 = getRoomForCoordinate(x2, y2);

  // Both avatars are inside the same room: clear acoustics
  if (room1 && room2 && room1.id === room2.id) {
    return 0.0;
  }

  // One is inside a soundproof room and other is outside
  const r1Settings = room1 ? roomSettings[room1.id] : null;
  const r2Settings = room2 ? roomSettings[room2.id] : null;

  if (r1Settings?.locked || r2Settings?.locked) {
    return Math.max(r1Settings?.soundproofFactor || 0, r2Settings?.soundproofFactor || 0, 0.95);
  }

  // Cross-boundary through normal walls
  if (room1?.id !== room2?.id) {
    return 0.65;
  }

  return 0.0;
}

/**
 * GET /api/rooms - List all corporate office rooms with acoustic ratings and lock state
 */
export async function getMeetingRooms(req, res) {
  try {
    const rooms = DEFAULT_OFFICE_LAYOUT.rooms.map((r) => {
      const settings = roomSettings[r.id] || { locked: false, soundproofFactor: 0.1, mode: "open" };
      return {
        id: r.id,
        name: r.name,
        icon: r.icon,
        bounds: r.bounds,
        spawn: r.spawn,
        desc: r.desc,
        isLocked: settings.locked,
        soundproofFactor: settings.soundproofFactor,
        mode: settings.mode
      };
    });

    return res.status(200).json({
      success: true,
      floor: DEFAULT_OFFICE_LAYOUT.floorName,
      totalRooms: rooms.length,
      data: rooms
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/rooms/:roomId/lock - Toggle room privacy and soundproofing lock
 */
export async function toggleRoomLock(req, res) {
  try {
    const { roomId } = req.params;
    const { locked } = req.body;

    if (!roomSettings[roomId]) {
      roomSettings[roomId] = { locked: false, soundproofFactor: 0.85, mode: "meeting" };
    }

    roomSettings[roomId].locked = locked !== undefined ? Boolean(locked) : !roomSettings[roomId].locked;

    return res.status(200).json({
      success: true,
      roomId,
      isLocked: roomSettings[roomId].locked,
      soundproofFactor: roomSettings[roomId].soundproofFactor,
      message: `Room ${roomId} privacy lock is now ${roomSettings[roomId].locked ? "ENABLED (Soundproof Isolated)" : "DISABLED (Open Hearing)"}`
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/rooms/isolation - Compute isolation factor between two coordinates
 */
export async function getAcousticIsolation(req, res) {
  try {
    const x1 = parseFloat(req.query.x1);
    const y1 = parseFloat(req.query.y1);
    const x2 = parseFloat(req.query.x2);
    const y2 = parseFloat(req.query.y2);

    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
      return res.status(400).json({ success: false, error: "Provide x1, y1, x2, y2 numbers" });
    }

    const isolation = calculateAcousticIsolation(x1, y1, x2, y2);
    const room1 = getRoomForCoordinate(x1, y1)?.name || "Open Floor";
    const room2 = getRoomForCoordinate(x2, y2)?.name || "Open Floor";

    return res.status(200).json({
      success: true,
      data: {
        listener: { x: x1, y: y1, room: room1 },
        speaker: { x: x2, y: y2, room: room2 },
        isolationFactor: isolation,
        isSoundproofIsolated: isolation >= 0.9,
        attenuatedGain: Math.max(0, 1 - isolation)
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/rooms/:roomId/recording/start - Start audio recording session
 */
export async function startRoomRecording(req, res) {
  try {
    const { roomId } = req.params;
    const { initiator } = req.body || {};
    const result = roomRecordingService.startRecording(roomId, initiator || "Colleague");
    return res.status(200).json({
      success: true,
      roomId,
      ...result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/rooms/:roomId/recording/stop - Stop audio recording session
 */
export async function stopRoomRecording(req, res) {
  try {
    const { roomId } = req.params;
    const finalized = roomRecordingService.stopRecording(roomId);
    if (!finalized) {
      return res.status(404).json({
        success: false,
        message: `No active recording session found in room: ${roomId}`,
      });
    }
    return res.status(200).json({
      success: true,
      roomId,
      recording: finalized,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/rooms/:roomId/recording - Get room recording status & history
 */
export async function getRoomRecordingStatus(req, res) {
  try {
    const { roomId } = req.params;
    const status = roomRecordingService.getRoomRecordingStatus(roomId);
    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/rooms/acoustics/materials - Get ISO 354 architectural acoustic materials
 */
export async function getAcousticMaterials(req, res) {
  try {
    const materials = spatialOcclusionService.getMaterials();
    return res.status(200).json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/rooms/acoustics/raytrace - Simulate 2D acoustic ray-tracing between coordinates
 */
export async function simulateAcousticRaytrace(req, res) {
  try {
    const { x1, y1, x2, y2 } = req.body || {};
    if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing coordinates: x1, y1, x2, y2 are required numbers",
      });
    }

    const simulation = spatialOcclusionService.simulateAcousticRaytrace(
      Number(x1),
      Number(y1),
      Number(x2),
      Number(y2)
    );

    return res.status(200).json({
      success: true,
      data: simulation,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/rooms/acoustics/noise-floor - Get ambient noise floors across all zones
 */
export async function getRoomNoiseFloors(req, res) {
  try {
    const floors = ambientNoiseService.getAllZoneNoiseFloors();
    return res.status(200).json({
      success: true,
      count: floors.length,
      data: floors,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/rooms/acoustics/snr - Calculate Signal-to-Noise Ratio & WebRTC Gate
 */
export async function computeVoiceSnr(req, res) {
  try {
    const { roomId, inputVoiceDb } = req.body || {};
    const analysis = ambientNoiseService.calculateVoiceSnr(
      roomId || "boardroom",
      inputVoiceDb !== undefined ? Number(inputVoiceDb) : 68.0
    );
    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
