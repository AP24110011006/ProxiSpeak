/**
 * Week 3: Acoustic Heatmap & Sound Pressure Level (SPL) Visualizer
 * Renders continuous 2D acoustic pressure gradients and decibel isolines across Floor 4
 * Author: Likhitha730 (likhitha branch)
 */

export class AcousticHeatmap {
  /**
   * Calculate cumulative Sound Pressure Level (SPL in dB) at any arbitrary floor coordinate
   * @param {number} x
   * @param {number} y
   * @param {Array} speakers - Array of { x, y, voiceDb, isSpeaking, isSoundproof }
   * @param {number} ambientDb - Baseline noise floor (default 38dB)
   */
  static calculateSplAtPoint(x, y, speakers = [], ambientDb = 38.0) {
    let totalLinearPower = Math.pow(10, ambientDb / 10);

    for (const spk of speakers) {
      if (!spk.isSpeaking) continue;

      const distPixels = Math.hypot(x - spk.x, y - spk.y);
      const distMeters = Math.max(0.5, distPixels / 20);

      // Inverse distance loss: 20 * log10(d)
      let sourceDb = spk.voiceDb || 68.0;
      let lossDb = 20 * Math.log10(distMeters);

      // If speaker is inside soundproof partition and point is outside, apply 32dB barrier drop
      if (spk.isSoundproof) {
        lossDb += 32.0;
      }

      const receivedDb = Math.max(0, sourceDb - lossDb);
      totalLinearPower += Math.pow(10, receivedDb / 10);
    }

    const totalSplDb = Math.round(10 * Math.log10(totalLinearPower) * 10) / 10;
    return totalSplDb;
  }

  /**
   * Render continuous acoustic heat gradients around active speaking avatars
   * @param {CanvasRenderingContext2D} ctx
   * @param {Array} speakers - Array of active avatars { x, y, isSpeaking, voiceDb, isSoundproof }
   * @param {number} radius - Acoustic radiation radius in pixels (default 120)
   */
  static drawAcousticHeatmap(ctx, speakers = [], radius = 120) {
    if (!ctx || !Array.isArray(speakers)) return;

    ctx.save();
    for (const spk of speakers) {
      if (!spk.isSpeaking) continue;

      const effectiveRadius = spk.isSoundproof ? radius * 0.45 : radius;

      // Radial acoustic pressure gradient
      const grad = ctx.createRadialGradient(spk.x, spk.y, 4, spk.x, spk.y, effectiveRadius);
      // High SPL core (> 68dB): warm gold/amber
      grad.addColorStop(0, "rgba(245, 158, 11, 0.35)");
      // Medium SPL (50-65dB): vocal emerald
      grad.addColorStop(0.4, "rgba(16, 185, 129, 0.20)");
      // Low SPL (38-50dB): soft cyan fade
      grad.addColorStop(0.8, "rgba(56, 189, 248, 0.08)");
      grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");

      ctx.beginPath();
      ctx.arc(spk.x, spk.y, effectiveRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Render concentric acoustic decibel contour rings
      for (let r = 0.35; r <= 0.85; r += 0.25) {
        ctx.beginPath();
        ctx.arc(spk.x, spk.y, effectiveRadius * r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.25 * (1 - r)})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
