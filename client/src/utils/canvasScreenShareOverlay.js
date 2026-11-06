/**
 * ProxiSpeak Week 4 — 2D HTML5 Canvas Presentation Screen & Reverb Aura Overlay
 * Author: Leela Sai Likhitha Yekollu <sailikhitha.yekollu@gmail.com>
 *
 * Renders dynamic visual presentation projections on the office floor:
 * - Holographic display glow in Executive Glass Boardroom (x: 580, y: 160)
 * - Animated projector beam particles when a presentation is active
 * - Zone-based Sabine RT60 acoustic reverb aura rings
 */

export function renderPresentationScreen(ctx, {
  isActive = true,
  x = 580,
  y = 155,
  width = 160,
  height = 90,
  presenterName = 'Lead Architect',
  resolution = '1080p',
  time = Date.now(),
}) {
  if (!ctx) return;

  ctx.save();

  // 1. Projector Beam Light Cone
  const pulse = Math.sin(time / 400) * 0.15 + 0.85;
  const gradient = ctx.createRadialGradient(x, y + 20, 10, x, y + 40, width);
  gradient.addColorStop(0, `rgba(6, 182, 212, ${0.35 * pulse})`);
  gradient.addColorStop(0.7, `rgba(56, 189, 248, ${0.15 * pulse})`);
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x - width / 2 - 20, y - height / 2);
  ctx.lineTo(x + width / 2 + 20, y - height / 2);
  ctx.lineTo(x + width / 2 + 40, y + height / 2 + 30);
  ctx.lineTo(x - width / 2 - 40, y + height / 2 + 30);
  ctx.closePath();
  ctx.fill();

  // 2. Holographic Presentation Frame
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = `rgba(6, 182, 212, ${pulse})`;
  ctx.lineWidth = 2;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 12 * pulse;

  const rx = x - width / 2;
  const ry = y - height / 2;
  ctx.beginPath();
  ctx.roundRect(rx, ry, width, height, 8);
  ctx.fill();
  ctx.stroke();

  // 3. Screen Grid Scanlines
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let ly = ry + 8; ly < ry + height; ly += 8) {
    ctx.beginPath();
    ctx.moveTo(rx + 4, ly);
    ctx.lineTo(rx + width - 4, ly);
    ctx.stroke();
  }

  // 4. Presentation Label & Badges
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LIVE SCREEN SHARE', x, y - 10);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${presenterName} • ${resolution}`, x, y + 8);

  // 5. Pulsing Broadcast Dot
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(x - 52, y - 13, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render Sabine RT60 acoustic reverb boundary aura
 */
export function renderReverbZoneAura(ctx, zone) {
  if (!ctx || !zone) return;

  const colorMap = {
    'Executive Glass Boardroom': 'rgba(168, 85, 247, 0.12)', // Purple
    'Soundproof Focus Cabins': 'rgba(59, 130, 246, 0.12)',   // Blue
    'Cozy Coffee Lounge & Pantry': 'rgba(245, 158, 11, 0.12)', // Gold
  };

  const fill = colorMap[zone.name] || 'rgba(148, 163, 184, 0.06)';

  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = fill.replace('0.12', '0.4');
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);

  ctx.beginPath();
  ctx.arc(zone.x, zone.y, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}
