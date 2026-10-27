/**
 * Week 3: Corporate Office Acoustic Zone Boundaries & Soundproofing
 */

export const ROOM_ACOUSTIC_PROPERTIES = {
  boardroom: {
    id: "boardroom",
    name: "Executive Glass Boardroom",
    isSoundproof: true,
    isolationFactor: 0.95,
    cutoffFrequencyHz: 450, // Low-pass filter muffling
    color: "#38bdf8",
    bounds: { x: 390, y: 40, width: 380, height: 280 }
  },
  focus_cabins: {
    id: "focus_cabins",
    name: "Soundproof Focus Cabins",
    isSoundproof: true,
    isolationFactor: 0.98,
    cutoffFrequencyHz: 350,
    color: "#a855f7",
    bounds: { x: 350, y: 645, width: 490, height: 75 }
  },
  dev_pods: {
    id: "dev_pods",
    name: "Dev Pods Collaboration",
    isSoundproof: false,
    isolationFactor: 0.20,
    cutoffFrequencyHz: 1200,
    color: "#10b981",
    bounds: { x: 350, y: 330, width: 490, height: 310 }
  }
};

/**
 * Check if a given office zone has soundproof isolation enabled
 */
export function isSoundproofZone(zoneName = "") {
  return (
    zoneName.includes("Boardroom") ||
    zoneName.includes("Focus Cabins") ||
    zoneName.includes("Soundproof")
  );
}

/**
 * Compute audio transmission factor between two zones (1.0 = clear, 0.0 = completely muted)
 */
export function computeAcousticTransmission(zoneA, zoneB) {
  if (!zoneA || !zoneB) return 1.0;
  if (zoneA === zoneB) return 1.0; // Same room: full clarity

  const aSoundproof = isSoundproofZone(zoneA);
  const bSoundproof = isSoundproofZone(zoneB);

  // If either party is in a soundproof room, audio is isolated
  if (aSoundproof || bSoundproof) {
    return 0.05; // 95% barrier
  }

  // Cross-pod open floor audio
  return 0.65;
}

/**
 * Week 3: Frequency reverberation & clarity profiles per zone
 */
export const ACOUSTIC_FREQUENCY_PROFILES = {
  boardroom: { rt60Seconds: 0.35, dspPreset: "acoustic-glass", clarityScore: 98, absorptionCoeff: 0.85 },
  focus_cabins: { rt60Seconds: 0.20, dspPreset: "studio-dry", clarityScore: 99, absorptionCoeff: 0.95 },
  dev_pods: { rt60Seconds: 0.60, dspPreset: "open-office", clarityScore: 88, absorptionCoeff: 0.30 },
  lounge: { rt60Seconds: 0.75, dspPreset: "ambient-lounge", clarityScore: 82, absorptionCoeff: 0.25 },
  reception: { rt60Seconds: 0.80, dspPreset: "spacious-lobby", clarityScore: 85, absorptionCoeff: 0.20 }
};

/**
 * Estimate acoustic wall ray-trace intersections between two coordinates
 * Returns number of barrier crossings and overall sound attenuation percentage
 */
export function calculateAcousticRayTrace(startX, startY, endX, endY) {
  let barrierCrossings = 0;
  const rooms = Object.values(ROOM_ACOUSTIC_PROPERTIES);

  for (const room of rooms) {
    const b = room.bounds;
    const startInside = startX >= b.x && startX <= b.x + b.width && startY >= b.y && startY <= b.y + b.height;
    const endInside = endX >= b.x && endX <= b.x + b.width && endY >= b.y && endY <= b.y + b.height;

    // Line crosses the boundary of this room
    if (startInside !== endInside) {
      barrierCrossings += 1;
    }
  }

  const attenuationPercent = Math.min(95, barrierCrossings * 45);
  return {
    crossings: barrierCrossings,
    attenuationPercent,
    isOccluded: barrierCrossings > 0,
    transmittedGain: Math.max(0.05, (100 - attenuationPercent) / 100)
  };
}

/**
 * Retrieve acoustic dampening summary for canvas UI overlays
 */
export function getAcousticDampeningSummary(zoneName = "") {
  for (const [key, prop] of Object.entries(ROOM_ACOUSTIC_PROPERTIES)) {
    if (zoneName.toLowerCase().includes(key) || zoneName.toLowerCase().includes(prop.name.toLowerCase())) {
      const profile = ACOUSTIC_FREQUENCY_PROFILES[key] || {};
      return {
        room: prop.name,
        isSoundproof: prop.isSoundproof,
        isolationPercent: Math.round(prop.isolationFactor * 100),
        cutoffHz: prop.cutoffFrequencyHz,
        rt60: profile.rt60Seconds || 0.5,
        dspPreset: profile.dspPreset || "standard"
      };
    }
  }

  return {
    room: zoneName || "Open Floor",
    isSoundproof: false,
    isolationPercent: 10,
    cutoffHz: 12000,
    rt60: 0.65,
    dspPreset: "open-air"
  };
}
