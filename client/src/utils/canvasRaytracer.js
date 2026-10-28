/**
 * Week 3: Canvas 2D Acoustic Ray-Tracer & Diffraction Wavelet Visualizer
 * Renders acoustic sound reflections and doorway diffraction directly on HTML5 Canvas
 * Author: Likhitha730 (likhitha branch)
 */

export class CanvasRaytracer {
  /**
   * Render simulated sound rays radiating from a speaker avatar and reflecting off boundaries
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} speakerX
   * @param {number} speakerY
   * @param {number} rayCount - Number of acoustic rays (e.g. 12)
   * @param {number} rayLength - Maximum propagation distance (e.g. 140px)
   * @param {number} animPhase - Time-based phase (0.0 to 1.0)
   */
  static drawAcousticRays(ctx, speakerX, speakerY, rayCount = 12, rayLength = 140, animPhase = 0) {
    if (!ctx) return;

    ctx.save();
    const angleStep = (Math.PI * 2) / rayCount;

    for (let i = 0; i < rayCount; i++) {
      const angle = i * angleStep + animPhase * 0.2;
      const currentLength = rayLength * (0.6 + 0.4 * Math.sin(animPhase * Math.PI * 2 + i));

      const targetX = speakerX + Math.cos(angle) * currentLength;
      const targetY = speakerY + Math.sin(angle) * currentLength;

      // Create gradient along the ray path (bright at origin -> fading at boundary)
      const grad = ctx.createLinearGradient(speakerX, speakerY, targetX, targetY);
      grad.addColorStop(0, "rgba(56, 189, 248, 0.7)");
      grad.addColorStop(0.7, "rgba(56, 189, 248, 0.25)");
      grad.addColorStop(1, "rgba(56, 189, 248, 0.0)");

      ctx.beginPath();
      ctx.moveTo(speakerX, speakerY);
      ctx.lineTo(targetX, targetY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      // Render small acoustic photon particle at ray tip
      ctx.beginPath();
      ctx.arc(targetX, targetY, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.5)";
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Render doorway acoustic diffraction wavelets bending around partition edges
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} doorX
   * @param {number} doorY
   * @param {number} animPhase
   */
  static drawDoorwayDiffraction(ctx, doorX = 340, doorY = 320, animPhase = 0) {
    if (!ctx) return;

    ctx.save();
    for (let w = 0; w < 3; w++) {
      const phaseOffset = (animPhase + w / 3) % 1;
      const radius = 10 + phaseOffset * 35;
      const alpha = Math.max(0, 1 - phaseOffset) * 0.45;

      ctx.beginPath();
      // Arc curving from doorway aperture into open hallway
      ctx.arc(doorX, doorY, radius, -Math.PI / 4, Math.PI / 4);
      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();
  }
}
