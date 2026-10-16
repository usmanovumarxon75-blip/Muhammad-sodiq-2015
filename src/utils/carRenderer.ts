/**
 * Canvas vector renderer for Player (Blue car) and Enemies (Red cars)
 */

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number = 0
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2 + 5);
  ctx.rotate(angle);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, 10);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws the Player's Blue Car
 */
export function drawBluePlayerCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
  isBraking: boolean,
  isAccelerating: boolean
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);

  const w = width;
  const h = height;

  // Headlight beams shining forward (upward)
  const beamGrad = ctx.createLinearGradient(0, -h / 2, 0, -h / 2 - 80);
  beamGrad.addColorStop(0, 'rgba(219, 234, 254, 0.45)');
  beamGrad.addColorStop(1, 'rgba(147, 197, 253, 0)');
  ctx.fillStyle = beamGrad;

  // Left headlight beam
  ctx.beginPath();
  ctx.moveTo(-w * 0.35, -h / 2);
  ctx.lineTo(-w * 0.7, -h / 2 - 80);
  ctx.lineTo(-w * 0.1, -h / 2 - 80);
  ctx.closePath();
  ctx.fill();

  // Right headlight beam
  ctx.beginPath();
  ctx.moveTo(w * 0.35, -h / 2);
  ctx.lineTo(w * 0.1, -h / 2 - 80);
  ctx.lineTo(w * 0.7, -h / 2 - 80);
  ctx.closePath();
  ctx.fill();

  // 4 Wheels
  ctx.fillStyle = '#0f172a';
  const wheelW = w * 0.18;
  const wheelH = h * 0.22;
  // Front Left
  ctx.fillRect(-w / 2 - wheelW * 0.4, -h * 0.38, wheelW, wheelH);
  // Front Right
  ctx.fillRect(w / 2 - wheelW * 0.6, -h * 0.38, wheelW, wheelH);
  // Rear Left
  ctx.fillRect(-w / 2 - wheelW * 0.4, h * 0.18, wheelW, wheelH);
  // Rear Right
  ctx.fillRect(w / 2 - wheelW * 0.6, h * 0.18, wheelW, wheelH);

  // Wheel silver rims
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-w / 2 - wheelW * 0.2, -h * 0.33, wheelW * 0.6, wheelH * 0.55);
  ctx.fillRect(w / 2 - wheelW * 0.4, -h * 0.33, wheelW * 0.6, wheelH * 0.55);
  ctx.fillRect(-w / 2 - wheelW * 0.2, h * 0.23, wheelW * 0.6, wheelH * 0.55);
  ctx.fillRect(w / 2 - wheelW * 0.4, h * 0.23, wheelW * 0.6, wheelH * 0.55);

  // Main Car Body (Blue Metallic)
  const bodyGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  bodyGrad.addColorStop(0, '#1d4ed8');
  bodyGrad.addColorStop(0.2, '#2563eb');
  bodyGrad.addColorStop(0.5, '#3b82f6');
  bodyGrad.addColorStop(0.8, '#2563eb');
  bodyGrad.addColorStop(1, '#1e40af');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, [12, 12, 8, 8]);
  ctx.fill();

  // Outer border / highlight
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Racing Stripes down the center (Dual cyan stripes)
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(-w * 0.14, -h / 2 + 4, w * 0.09, h - 8);
  ctx.fillRect(w * 0.05, -h / 2 + 4, w * 0.09, h - 8);

  // Windshield & Glass Cockpit
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  // Front windshield
  ctx.roundRect(-w * 0.38, -h * 0.25, w * 0.76, h * 0.42, 6);
  ctx.fill();

  // Roof (Blue)
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.roundRect(-w * 0.32, -h * 0.16, w * 0.64, h * 0.25, 4);
  ctx.fill();

  // Roof highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(-w * 0.28, -h * 0.13, w * 0.56, 3);

  // Front Headlights
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#fef08a';
  ctx.shadowBlur = 10;
  // Left light
  ctx.beginPath();
  ctx.arc(-w * 0.34, -h / 2 + 4, 4, 0, Math.PI * 2);
  ctx.fill();
  // Right light
  ctx.beginPath();
  ctx.arc(w * 0.34, -h / 2 + 4, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Rear Taillights (Red) - Glows brighter when braking
  ctx.fillStyle = isBraking ? '#ff2222' : '#dc2626';
  ctx.shadowColor = isBraking ? '#ff0000' : 'transparent';
  ctx.shadowBlur = isBraking ? 14 : 0;
  ctx.fillRect(-w * 0.44, h / 2 - 4, w * 0.26, 4);
  ctx.fillRect(w * 0.18, h / 2 - 4, w * 0.26, 4);
  ctx.shadowBlur = 0;

  // Rear spoiler
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-w * 0.46, h / 2 - 2, w * 0.92, 3);

  // Nitrous / exhaust flame effect when accelerating
  if (isAccelerating) {
    const flameGrad = ctx.createLinearGradient(0, h / 2, 0, h / 2 + 18);
    flameGrad.addColorStop(0, '#60a5fa');
    flameGrad.addColorStop(0.5, '#38bdf8');
    flameGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
    ctx.fillStyle = flameGrad;

    // Left exhaust flame
    ctx.beginPath();
    ctx.moveTo(-w * 0.28, h / 2);
    ctx.lineTo(-w * 0.22, h / 2 + 12 + Math.random() * 6);
    ctx.lineTo(-w * 0.16, h / 2);
    ctx.fill();

    // Right exhaust flame
    ctx.beginPath();
    ctx.moveTo(w * 0.16, h / 2);
    ctx.lineTo(w * 0.22, h / 2 + 12 + Math.random() * 6);
    ctx.lineTo(w * 0.28, h / 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws the Oncoming Red Cars
 */
export function drawRedEnemyCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  modelType: number
) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);

  const w = width;
  const h = height;

  // Oncoming headlights shining down toward the player
  const beamGrad = ctx.createLinearGradient(0, h / 2, 0, h / 2 + 65);
  beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
  beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = beamGrad;

  // Left headlight beam (facing down)
  ctx.beginPath();
  ctx.moveTo(-w * 0.35, h / 2);
  ctx.lineTo(-w * 0.65, h / 2 + 65);
  ctx.lineTo(-w * 0.1, h / 2 + 65);
  ctx.closePath();
  ctx.fill();

  // Right headlight beam (facing down)
  ctx.beginPath();
  ctx.moveTo(w * 0.35, h / 2);
  ctx.lineTo(w * 0.1, h / 2 + 65);
  ctx.lineTo(w * 0.65, h / 2 + 65);
  ctx.closePath();
  ctx.fill();

  // 4 Wheels
  ctx.fillStyle = '#0f172a';
  const wheelW = w * 0.18;
  const wheelH = h * 0.22;
  ctx.fillRect(-w / 2 - wheelW * 0.4, -h * 0.38, wheelW, wheelH);
  ctx.fillRect(w / 2 - wheelW * 0.6, -h * 0.38, wheelW, wheelH);
  ctx.fillRect(-w / 2 - wheelW * 0.4, h * 0.18, wheelW, wheelH);
  ctx.fillRect(w / 2 - wheelW * 0.6, h * 0.18, wheelW, wheelH);

  // Wheel hubs
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-w / 2 - wheelW * 0.2, -h * 0.33, wheelW * 0.6, wheelH * 0.55);
  ctx.fillRect(w / 2 - wheelW * 0.4, -h * 0.33, wheelW * 0.6, wheelH * 0.55);
  ctx.fillRect(-w / 2 - wheelW * 0.2, h * 0.23, wheelW * 0.6, wheelH * 0.55);
  ctx.fillRect(w / 2 - wheelW * 0.4, h * 0.23, wheelW * 0.6, wheelH * 0.55);

  // Car Body (Red tone variations for enemy models)
  const primaryRed = modelType === 0 ? '#dc2626' : modelType === 1 ? '#b91c1c' : '#ef4444';
  const darkRed = modelType === 0 ? '#991b1b' : modelType === 1 ? '#7f1d1d' : '#b91c1c';
  const brightRed = modelType === 0 ? '#f87171' : modelType === 1 ? '#ef4444' : '#fca5a5';

  const bodyGrad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
  bodyGrad.addColorStop(0, darkRed);
  bodyGrad.addColorStop(0.2, primaryRed);
  bodyGrad.addColorStop(0.5, brightRed);
  bodyGrad.addColorStop(0.8, primaryRed);
  bodyGrad.addColorStop(1, darkRed);

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Oncoming car has rounded front at bottom
  ctx.roundRect(-w / 2, -h / 2, w, h, [8, 8, 12, 12]);
  ctx.fill();

  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Sports hood stripe / black hood accents
  if (modelType === 1) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-w * 0.18, 0, w * 0.36, h / 2 - 6);
  } else if (modelType === 2) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w * 0.08, -h / 2 + 4, w * 0.16, h - 8);
  }

  // Windshield (facing down: front windshield at bottom)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-w * 0.38, -h * 0.22, w * 0.76, h * 0.42, 6);
  ctx.fill();

  // Glass glare reflection
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.moveTo(-w * 0.3, -h * 0.18);
  ctx.lineTo(-w * 0.1, -h * 0.18);
  ctx.lineTo(w * 0.1, h * 0.15);
  ctx.lineTo(-w * 0.1, h * 0.15);
  ctx.closePath();
  ctx.fill();

  // Roof
  ctx.fillStyle = primaryRed;
  ctx.beginPath();
  ctx.roundRect(-w * 0.3, -h * 0.14, w * 0.6, h * 0.25, 4);
  ctx.fill();

  // Front Headlights (at the bottom, facing player)
  ctx.fillStyle = '#fef08a';
  ctx.shadowColor = '#fef08a';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(-w * 0.34, h / 2 - 4, 3.5, 0, Math.PI * 2);
  ctx.arc(w * 0.34, h / 2 - 4, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Front Grille
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-w * 0.22, h / 2 - 4, w * 0.44, 3);

  // Rear Taillights (at the top)
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-w * 0.42, -h / 2 + 1, w * 0.22, 3);
  ctx.fillRect(w * 0.2, -h / 2 + 1, w * 0.22, 3);

  ctx.restore();
}
