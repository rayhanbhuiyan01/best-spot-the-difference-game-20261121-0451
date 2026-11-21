// Pointer and keyboard input: clicks on either panel are tested against the
// scene's differences, and keys drive hint / next level / restart / mute.
import { panelLayout } from './render.js';
import {
  PHASES,
  currentScene,
  nextLevel,
  registerClick,
  startGame,
  startLevel,
  useHint,
} from './state.js';
import { playFound, playWrong, playHint, playLevelClear, setMuted, isMuted } from './audio.js';

export function installInput(canvas, state, hud) {
  canvas.addEventListener('pointerdown', (event) => {
    if (state.phase !== PHASES.PLAYING) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    handlePanelClick(canvas, state, hud, x, y);
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (key === 'h') doHint(state, hud);
    else if (key === 'r') startLevel(state, state.levelIndex);
    else if (key === 'n') {
      if (state.phase === PHASES.LEVEL_CLEAR) nextLevel(state);
    } else if (key === 'm') {
      setMuted(!isMuted());
      hud.refresh();
    } else if (key === 'enter' || key === ' ') {
      if (state.phase === PHASES.TITLE) startGame(state);
      else if (state.phase === PHASES.LEVEL_CLEAR) nextLevel(state);
      else if (state.phase === PHASES.TIME_UP) startLevel(state, state.levelIndex);
      else if (state.phase === PHASES.GAME_CLEAR) startGame(state);
    }
    hud.refresh();
  });
}

function handlePanelClick(canvas, state, hud, x, y) {
  const layout = panelLayout(canvas.width);
  const scene = currentScene(state);
  let panel = null;
  let box = null;
  if (x >= layout.left.x && x <= layout.left.x + layout.left.w && y >= layout.left.y && y <= layout.left.y + layout.left.h) {
    panel = 'left';
    box = layout.left;
  } else if (x >= layout.right.x && x <= layout.right.x + layout.right.w && y >= layout.right.y && y <= layout.right.y + layout.right.h) {
    panel = 'right';
    box = layout.right;
  }
  if (!box) return;
  const fx = (x - box.x) / box.w;
  const fy = (y - box.y) / box.h;
  let hit = -1;
  let best = Infinity;
  scene.differences.forEach((d, i) => {
    const dist = Math.hypot(fx - d.x, fy - d.y);
    if (dist < d.r && dist < best) {
      best = dist;
      hit = i;
    }
  });

  if (hit === -1) {
    registerClick(state, -1);
    state.wrongMarks.push({ panel, x, y, at: performance.now() });
    state.message = 'Not a difference — minus 5 seconds!';
    state.messageUntil = Date.now() + 1600;
    playWrong();
  } else if (state.found.has(hit)) {
    state.message = 'You already found that one!';
    state.messageUntil = Date.now() + 1200;
  } else {
    const found = registerClick(state, hit);
    state.message = found ? `Found it — ${found.name}! +100` : '';
    state.messageUntil = Date.now() + 1800;
    playFound();
    if (state.phase === PHASES.LEVEL_CLEAR || state.phase === PHASES.GAME_CLEAR) playLevelClear();
  }
  hud.refresh();
}

export function doHint(state, hud) {
  const hint = useHint(state);
  if (hint) {
    state.message = `Hint: look near — ${hint.name}`;
    state.messageUntil = Date.now() + 4000;
    playHint();
  } else {
    state.message = state.hintsLeft <= 0 ? 'No hints left this level!' : 'No hint right now.';
    state.messageUntil = Date.now() + 1600;
  }
  hud.refresh();
}
