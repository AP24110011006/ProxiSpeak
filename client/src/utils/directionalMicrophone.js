/**
 * Week 3: Directional Microphone Polar Patterns & Acoustic Directivity Engine
 * Models Cardioid, Supercardioid, Hypercardioid, Figure-8, and Omnidirectional microphone
 * polar patterns for avatars based on their facing vector.
 * Author: Likhitha730 (likhitha branch)
 */

export const POLAR_PATTERNS = {
  omni: {
    name: "Omnidirectional",
    desc: "Equal 360° vocal sensitivity in all directions",
    directivityIndexDb: 0,
    frontToBackRatioDb: 0,
    calculateSensitivity(theta) {
      return 1.0;
    },
  },
  cardioid: {
    name: "Cardioid Directional",
    desc: "Strong forward vocal focus; rejects audio from behind avatar (180° null)",
    directivityIndexDb: 4.8,
    frontToBackRatioDb: 20,
    calculateSensitivity(theta) {
      // P(theta) = 0.5 * (1 + cos(theta))
      return Math.max(0.01, 0.5 * (1 + Math.cos(theta)));
    },
  },
  supercardioid: {
    name: "Supercardioid (Focus)",
    desc: "Narrow front pickup beam; optimal for open-plan office desk workstations",
    directivityIndexDb: 5.7,
    frontToBackRatioDb: 12,
    calculateSensitivity(theta) {
      // P(theta) = 0.37 + 0.63 * cos(theta)
      return Math.max(0.01, Math.abs(0.37 + 0.63 * Math.cos(theta)));
    },
  },
  figure8: {
    name: "Bidirectional (Figure-8)",
    desc: "Picks up front and back; rejects left and right flanks (90° and 270° nulls)",
    directivityIndexDb: 4.8,
    frontToBackRatioDb: 0,
    calculateSensitivity(theta) {
      // P(theta) = |cos(theta)|
      return Math.max(0.01, Math.abs(Math.cos(theta)));
    },
  },
};

export class DirectionalMicrophone {
  /**
   * Calculate directional vocal transmission gain between speaker and listener
   * @param {number} speakerX
   * @param {number} speakerY
   * @param {number} speakerFacingAngle - Radians (0 = East, PI/2 = South, etc.)
   * @param {number} listenerX
   * @param {number} listenerY
   * @param {string} patternKey - "omni", "cardioid", "supercardioid", "figure8"
   */
  static computeDirectivityGain(
    speakerX,
    speakerY,
    speakerFacingAngle = 0,
    listenerX,
    listenerY,
    patternKey = "cardioid"
  ) {
    const pattern = POLAR_PATTERNS[patternKey] || POLAR_PATTERNS.cardioid;
    const dx = listenerX - speakerX;
    const dy = listenerY - speakerY;

    if (dx === 0 && dy === 0) return 1.0;

    const angleToListener = Math.atan2(dy, dx);
    let relativeAngle = angleToListener - speakerFacingAngle;

    while (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;
    while (relativeAngle < -Math.PI) relativeAngle += 2 * Math.PI;

    const sensitivity = pattern.calculateSensitivity(relativeAngle);
    const angleDeg = Math.round((relativeAngle * 180) / Math.PI);

    return {
      pattern: pattern.name,
      patternKey,
      relativeAngleDeg: angleDeg,
      directivityGain: Math.round(sensitivity * 100) / 100,
      attenuationDb: Math.round(20 * Math.log10(Math.max(0.01, sensitivity)) * 10) / 10,
    };
  }

  /**
   * Render directional microphone polar pickup lobe on HTML5 Canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Avatar X
   * @param {number} y - Avatar Y
   * @param {number} facingAngle - Radians
   * @param {string} patternKey
   * @param {number} radius - Lobe length in pixels (e.g. 45px)
   */
  static drawPolarLobe(ctx, x, y, facingAngle = 0, patternKey = "cardioid", radius = 45) {
    if (!ctx) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(facingAngle);

    const pattern = POLAR_PATTERNS[patternKey] || POLAR_PATTERNS.cardioid;
    const steps = 36;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const theta = (i * 2 * Math.PI) / steps;
      const sens = pattern.calculateSensitivity(theta);
      const r = radius * sens;
      const px = Math.cos(theta) * r;
      const py = Math.sin(theta) * r;
      points.push({ x: px, y: py });
    }

    // Draw filled polar lobe
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Small forward facing aim pointer
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius * 0.8, 0);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.stroke();

    ctx.restore();
  }
}
