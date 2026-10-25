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
  boardroom: { rt60Seconds: 0.35, dspPreset: "acoustic-glass", clarityScore: 98 },
  focus_cabins: { rt60Seconds: 0.20, dspPreset: "studio-dry", clarityScore: 99 },
  dev_pods: { rt60Seconds: 0.60, dspPreset: "open-office", clarityScore: 88 },
  lounge: { rt60Seconds: 0.75, dspPreset: "ambient-lounge", clarityScore: 82 }
};
