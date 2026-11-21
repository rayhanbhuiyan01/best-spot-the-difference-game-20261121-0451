// Tiny synthesized sound effects with WebAudio — no audio files, no network.
// Every sound is a short oscillator blip, so the game stays fully offline.
let audioContext = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function context() {
  if (!audioContext) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function blip(freqStart, freqEnd, duration, type, volume) {
  if (muted) return;
  const ctx = context();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), ctx.currentTime + duration);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// A bright two-note chime when a difference is found.
export function playFound() {
  blip(660, 660, 0.09, 'sine', 0.25);
  window.setTimeout(() => blip(990, 990, 0.14, 'sine', 0.22), 80);
}

// A low buzz for a wrong click.
export function playWrong() {
  blip(180, 110, 0.18, 'square', 0.12);
}

// A soft shimmer when a hint is spent.
export function playHint() {
  blip(520, 1040, 0.25, 'triangle', 0.16);
}

// A little fanfare when a level is cleared.
export function playLevelClear() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    window.setTimeout(() => blip(freq, freq, 0.16, 'sine', 0.22), i * 110);
  });
}

// A gentle tick as the timer runs under ten seconds.
export function playTick() {
  blip(880, 880, 0.05, 'sine', 0.08);
}
