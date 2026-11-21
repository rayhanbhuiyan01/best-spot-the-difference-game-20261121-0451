// Game state: which level, what is found, the clock, the score and the hints.
// Pure data plus small transitions — the renderer reads this, input writes to it.
import { SCENES } from './scenes.js';

export const PHASES = {
  TITLE: 'title',
  PLAYING: 'playing',
  LEVEL_CLEAR: 'level-clear',
  TIME_UP: 'time-up',
  GAME_CLEAR: 'game-clear',
};

export function createState() {
  return {
    phase: PHASES.TITLE,
    levelIndex: 0,
    found: new Set(),
    wrongMarks: [],
    hintMark: null,
    hintsLeft: 3,
    score: 0,
    timeLeft: SCENES[0].timeLimit,
    levelBonus: 0,
    message: '',
    messageUntil: 0,
    lastTickSecond: -1,
    totalFound: 0,
    totalWrong: 0,
    startedAt: 0,
  };
}

export function currentScene(state) {
  return SCENES[state.levelIndex];
}

export function differencesLeft(state) {
  return currentScene(state).differences.length - state.found.size;
}

export function startLevel(state, levelIndex) {
  state.levelIndex = levelIndex;
  state.found = new Set();
  state.wrongMarks = [];
  state.hintMark = null;
  state.hintsLeft = 3;
  state.timeLeft = SCENES[levelIndex].timeLimit;
  state.levelBonus = 0;
  state.phase = PHASES.PLAYING;
  state.lastTickSecond = -1;
  state.startedAt = Date.now();
  state.message = '';
}

export function startGame(state) {
  state.score = 0;
  state.totalFound = 0;
  state.totalWrong = 0;
  startLevel(state, 0);
}

// Returns the difference that was found, or null when the click missed.
export function registerClick(state, diffIndex) {
  const scene = currentScene(state);
  if (state.phase !== PHASES.PLAYING) return null;
  if (diffIndex === -1) {
    state.totalWrong += 1;
    state.score = Math.max(0, state.score - 10);
    state.timeLeft = Math.max(0, state.timeLeft - 5);
    return null;
  }
  if (state.found.has(diffIndex)) return scene.differences[diffIndex];
  state.found.add(diffIndex);
  state.totalFound += 1;
  state.score += 100;
  state.timeLeft = Math.min(scene.timeLimit, state.timeLeft + 3);
  if (state.found.size === scene.differences.length) {
    state.levelBonus = Math.round(state.timeLeft) * 5;
    state.score += state.levelBonus;
    state.phase = state.levelIndex + 1 >= SCENES.length ? PHASES.GAME_CLEAR : PHASES.LEVEL_CLEAR;
  }
  return scene.differences[diffIndex];
}

// Spend one hint: reveal a random unfound difference for a few seconds.
export function useHint(state) {
  if (state.phase !== PHASES.PLAYING || state.hintsLeft <= 0) return null;
  const scene = currentScene(state);
  const remaining = scene.differences
    .map((d, i) => i)
    .filter((i) => !state.found.has(i));
  if (remaining.length === 0) return null;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - 25);
  state.hintMark = { index: pick, until: Date.now() + 4000 };
  return scene.differences[pick];
}

export function nextLevel(state) {
  if (state.levelIndex + 1 < SCENES.length) startLevel(state, state.levelIndex + 1);
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
