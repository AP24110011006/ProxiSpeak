/**
 * Week 3: Architectural Acoustic Materials & Spatial Occlusion Service
 * Implements ISO 354 frequency-dependent sound absorption coefficients,
 * doorway diffraction modeling, and 2D acoustic ray attenuation.
 * Author: Koneti Manikanth (manikanth branch)
 */

export const ACOUSTIC_MATERIALS = {
  double_glazed_glass: {
    name: "Laminated Acoustic Glass (Boardroom)",
    thicknessMm: 12.8,
    soundTransmissionClass: 42, // STC rating
    absorptionCoefficients: {
      "125Hz": 0.18,
      "250Hz": 0.06,
      "500Hz": 0.04,
      "1000Hz": 0.03,
      "2000Hz": 0.02,
      "4000Hz": 0.02,
    },
    averageAbsorption: 0.06,
    soundproofBarrierFactor: 0.95,
  },
  acoustic_drywall: {
    name: "Double Drywall with Acoustic Mineral Wool",
    thicknessMm: 100,
    soundTransmissionClass: 50,
    absorptionCoefficients: {
      "125Hz": 0.28,
      "250Hz": 0.12,
      "500Hz": 0.08,
      "1000Hz": 0.06,
      "2000Hz": 0.06,
      "4000Hz": 0.07,
    },
    averageAbsorption: 0.11,
    soundproofBarrierFactor: 0.98,
  },
  perforated_ceiling_tile: {
    name: "Acoustic Fiberglass Ceiling Tile",
    thicknessMm: 19,
    soundTransmissionClass: 35,
    absorptionCoefficients: {
      "125Hz": 0.65,
      "250Hz": 0.85,
      "500Hz": 0.90,
      "1000Hz": 0.95,
      "2000Hz": 0.90,
      "4000Hz": 0.85,
    },
    averageAbsorption: 0.85,
    soundproofBarrierFactor: 0.40,
  },
  commercial_carpet: {
    name: "Heavy Commercial Tufted Carpet on Underlay",
    thicknessMm: 9,
    soundTransmissionClass: 25,
    absorptionCoefficients: {
      "125Hz": 0.08,
      "250Hz": 0.24,
      "500Hz": 0.57,
      "1000Hz": 0.69,
      "2000Hz": 0.71,
      "4000Hz": 0.73,
    },
    averageAbsorption: 0.50,
    soundproofBarrierFactor: 0.15,
  },
  open_air_doorway: {
    name: "Unobstructed Doorway Aperture",
    thicknessMm: 0,
    soundTransmissionClass: 0,
    absorptionCoefficients: {
      "125Hz": 1.0,
      "250Hz": 1.0,
      "500Hz": 1.0,
      "1000Hz": 1.0,
      "2000Hz": 1.0,
      "4000Hz": 1.0,
    },
    averageAbsorption: 1.0,
    soundproofBarrierFactor: 0.0,
  },
};

export const spatialOcclusionService = {
  /**
   * Get all registered architectural acoustic materials
   */
  getMaterials() {
    return Object.entries(ACOUSTIC_MATERIALS).map(([id, mat]) => ({
      id,
      ...mat,
    }));
  },

  /**
   * Calculate frequency-specific attenuation across an acoustic barrier
   * @param {string} materialId - Key from ACOUSTIC_MATERIALS
   * @param {number} distanceMeters - Distance between speaker and listener
   */
  computeFrequencyAttenuation(materialId = "double_glazed_glass", distanceMeters = 5) {
    const mat = ACOUSTIC_MATERIALS[materialId] || ACOUSTIC_MATERIALS.double_glazed_glass;
    const baseAirLossDbPerMeter = 0.005; // Standard 20C, 50% humidity
    const distanceLossDb = 20 * Math.log10(Math.max(1, distanceMeters));

    const frequencyLossDb = {};
    for (const [freq, coeff] of Object.entries(mat.absorptionCoefficients)) {
      // Transmission loss: Higher STC and lower absorption = more attenuation
      const transmissionLossDb = (mat.soundTransmissionClass * (1 - coeff * 0.4)) + (distanceMeters * baseAirLossDbPerMeter);
      frequencyLossDb[freq] = Math.round((distanceLossDb + transmissionLossDb) * 10) / 10;
    }

    return {
      material: mat.name,
      materialId,
      distanceMeters,
      distanceLossDb: Math.round(distanceLossDb * 10) / 10,
      soundTransmissionClass: mat.soundTransmissionClass,
      soundproofBarrierFactor: mat.soundproofBarrierFactor,
      frequencyLossDb,
      lowpassCutoffHz: mat.soundproofBarrierFactor >= 0.9 ? 450 : mat.soundproofBarrierFactor >= 0.5 ? 1200 : 12000,
    };
  },

  /**
   * Simulate a 2D acoustic ray-trace between speaker (x1, y1) and listener (x2, y2)
   * on Floor 4, returning direct sound line, diffraction paths, and acoustic gain.
   */
  simulateAcousticRaytrace(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const directDistancePixels = Math.round(Math.hypot(dx, dy));
    const distanceMeters = Math.max(0.5, Math.round((directDistancePixels / 20) * 10) / 10);

    // Doorway coordinates on Floor 4 (Reception to Dev Area hallway: x: 340, y: 320)
    const doorway = { x: 340, y: 320, width: 60 };
    const distToDoorway = Math.hypot(doorway.x - x1, doorway.y - y1) + Math.hypot(x2 - doorway.x, y2 - doorway.y);

    // If direct ray intersects room boundaries:
    // Boardroom bounds: x: 390 to 770, y: 40 to 320
    const inBoardroom1 = x1 >= 390 && x1 <= 770 && y1 >= 40 && y1 <= 320;
    const inBoardroom2 = x2 >= 390 && x2 <= 770 && y2 >= 40 && y2 <= 320;

    const crossBoardroomWall = inBoardroom1 !== inBoardroom2;
    const activeMaterial = crossBoardroomWall ? "double_glazed_glass" : "commercial_carpet";
    const attenuation = this.computeFrequencyAttenuation(activeMaterial, distanceMeters);

    return {
      source: { x: x1, y: y1, zone: inBoardroom1 ? "Executive Boardroom" : "Open Floor" },
      target: { x: x2, y: y2, zone: inBoardroom2 ? "Executive Boardroom" : "Open Floor" },
      directDistancePixels,
      distanceMeters,
      crossesAcousticPartition: crossBoardroomWall,
      primaryMaterial: attenuation.material,
      diffractionPossible: crossBoardroomWall,
      diffractedDistancePixels: Math.round(distToDoorway),
      attenuation,
      acousticGainFactor: Math.max(0.02, Math.pow(10, -(attenuation.distanceLossDb + (crossBoardroomWall ? 32 : 0)) / 20)),
    };
  },
};
