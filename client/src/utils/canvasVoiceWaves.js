/**
 * Week 3: Canvas Voice Activity Waveform & Multi-Avatar Ripple Renderer
 * Draws dynamic multi-ring sinusoidal audio radiation waves radiating from speaking avatars
 * Author: Likhitha730 (likhitha branch)
 */

export class CanvasVoiceWaves {
  /**
   * Render concentric acoustic vocal radiation ripples around a speaking avatar
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Avatar center X
   * @param {number} y - Avatar center Y
   * @param {number} timestamp - Animation loop timestamp
   * @param {boolean} isSpeaking - Vocal presence state
   * @param {string} color - Wave stroke color (default emerald green)
   */
  static renderVoiceRipples(ctx, x, y, timestamp = 0, isSpeaking = true, color = "rgba(16, 185, 129, 0.85)") {
    if (!ctx || !isSpeaking) return;

    ctx.save();
    const rippleCount = 3;
    const cycleMs = 1200;

    for (let i = 0; i < rippleCount; i++) {
      const offset = (timestamp + (i * cycleMs) / rippleCount) % cycleMs;
      const progress = offset / cycleMs; // 0.0 to 1.0

      const radius = 12 + progress * 24; // expands from 12px to 36px
      const alpha = Math.max(0, 1 - progress) * 0.75;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = color.replace(/[\d.]+\)$/, `${alpha})`);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Render a vocal presence decibel level badge above an avatar
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} dbLevel - e.g. -42dB
   */
  static renderDecibelTag(ctx, x, y, dbLevel = -45) {
    if (!ctx) return;

    ctx.save();
    const tag = `${Math.round(dbLevel)} dB`;
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    const textWidth = ctx.measureText(tag).width;

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(x - textWidth / 2 - 3, y - 26, textWidth + 6, 13);

    ctx.fillStyle = dbLevel > -40 ? "#34d399" : "#94a3b8";
    ctx.fillText(tag, x, y - 16);
    ctx.restore();
  }
}
