// Rendering: draws both panels, the found markers, the hint ring, wrong-click
// crosses and the overlay screens onto the single canvas. The HUD itself is DOM.
import { currentScene, differencesLeft, formatTime, PHASES } from './state.js';

const TAU = Math.PI * 2;

// Panel geometry for a 1280x620 canvas: two 560x420 panels side by side.
export function panelLayout(canvasWidth) {
  const panelW = 560;
  const panelH = 420;
  const gap = 40;
  const totalW = panelW * 2 + gap;
  const leftX = (canvasWidth - totalW) / 2;
  const topY = 118;
  return {
    left: { x: leftX, y: topY, w: panelW, h: panelH },
    right: { x: leftX + panelW + gap, y: topY, w: panelW, h: panelH },
  };
}

export function drawPanels(ctx, state, now) {
  const scene = currentScene(state);
  const layout = panelLayout(ctx.canvas.width);
  drawOnePanel(ctx, scene, layout.left, false, state, now);
  drawOnePanel(ctx, scene, layout.right, true, state, now);
  drawPanelLabels(ctx, layout);
}

function drawOnePanel(ctx, scene, box, variant, state, now) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  // Shift the origin to the panel's corner so the scene draws inside it.
  ctx.translate(box.x, box.y);
  scene.draw(ctx, box.w, box.h, variant, scene.seed);
  ctx.restore();
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 4;
  ctx.strokeRect(box.x, box.y, box.w, box.h);

  // Markers on every difference already found — on both panels.
  for (const index of state.found) {
    const d = scene.differences[index];
    drawFoundMarker(ctx, box, d);
  }

  // The active hint pulses on both panels.
  if (state.hintMark && now < state.hintMark.until) {
    const d = scene.differences[state.hintMark.index];
    const pulse = 1 + 0.18 * Math.sin(now / 130);
    drawHintRing(ctx, box, d, pulse);
  }

  // Wrong clicks leave a fading red cross where the player clicked.
  state.wrongMarks = state.wrongMarks.filter((m) => now - m.at < 900);
  for (const mark of state.wrongMarks) {
    if (mark.panel !== (variant ? 'right' : 'left')) continue;
    const age = (now - mark.at) / 900;
    ctx.globalAlpha = 1 - age;
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 5;
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(mark.x - r, mark.y - r);
    ctx.lineTo(mark.x + r, mark.y + r);
    ctx.moveTo(mark.x + r, mark.y - r);
    ctx.lineTo(mark.x - r, mark.y + r);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawFoundMarker(ctx, box, d) {
  const cx = box.x + d.x * box.w;
  const cy = box.y + d.y * box.h;
  const r = d.r * box.w * 0.75;
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, TAU);
  ctx.stroke();
  // A small tick inside the circle.
  ctx.strokeStyle = '#2e7d32';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.4, cy);
  ctx.lineTo(cx - r * 0.1, cy + r * 0.35);
  ctx.lineTo(cx + r * 0.45, cy - r * 0.35);
  ctx.stroke();
}

function drawHintRing(ctx, box, d, pulse) {
  const cx = box.x + d.x * box.w;
  const cy = box.y + d.y * box.h;
  const r = d.r * box.w * 0.75 * pulse;
  ctx.strokeStyle = '#ff8f00';
  ctx.lineWidth = 5;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ff8f00';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HINT', cx, cy - r - 8);
}

function drawPanelLabels(ctx, layout) {
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#4e342e';
  ctx.fillText('ORIGINAL', layout.left.x + layout.left.w / 2, layout.left.y - 12);
  ctx.fillText('CHANGED COPY', layout.right.x + layout.right.w / 2, layout.right.y - 12);
}

// Big centred overlay used by the title, level-clear, time-up and game-clear screens.
export function drawOverlay(ctx, title, lines, accent) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.fillStyle = 'rgba(30, 27, 75, 0.72)';
  ctx.fillRect(0, 0, W, H);
  const boxW = 720;
  const boxH = 150 + lines.length * 36;
  const bx = (W - boxW) / 2;
  const by = (H - boxH) / 2;
  ctx.fillStyle = '#fff8e1';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  roundRect(ctx, bx, by, boxW, boxH, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3e2723';
  ctx.textAlign = 'center';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(title, W / 2, by + 62);
  ctx.font = '19px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, by + 108 + i * 36);
  });
}

export function drawTimerWarning(ctx, state) {
  if (state.phase !== 'playing' || state.timeLeft > 10) return;
  const W = ctx.canvas.width;
  ctx.fillStyle = state.timeLeft <= 5 ? '#e53935' : '#ef6c00';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Hurry — ${formatTime(state.timeLeft)} left!`, W / 2, 580);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function remainingText(state) {
  const left = differencesLeft(state);
  return `Found ${state.found.size} / ${currentScene(state).differences.length}  ·  ${left} to go`;
}
