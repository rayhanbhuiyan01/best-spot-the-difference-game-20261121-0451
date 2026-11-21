// Screenshot presets, driven by ?shot= in the URL. These are real renders of the
// game's own code in a chosen state — the same states a player reaches by playing.
//   ?shot=start  title screen over level 1
//   ?shot=play   level 1, nothing found yet
//   ?shot=mid    level 1, three differences found with markers, four still to go
//   ?shot=play2  level 2, two differences found
//   ?shot=end    level 1 cleared, with the time bonus
// A ?seed= value re-seeds the decoration; the differences never move.
import { PHASES, startLevel } from './state.js';

const MID_FOUND = [0, 3, 5];
const PLAY2_FOUND = [1, 4];

export function applyShotParam(state, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  startLevel(state, 0);
  if (shot === 'start') {
    state.phase = PHASES.TITLE;
  } else if (shot === 'play') {
    state.phase = PHASES.PLAYING;
  } else if (shot === 'mid') {
    state.phase = PHASES.PLAYING;
    for (const i of MID_FOUND) state.found.add(i);
    state.score = 300;
    state.timeLeft = 87;
    state.message = 'Found it — The fish vanished! +100';
    state.messageUntil = Date.now() + 60000;
  } else if (shot === 'play2') {
    startLevel(state, 1);
    state.phase = PHASES.PLAYING;
    for (const i of PLAY2_FOUND) state.found.add(i);
    state.score = 700;
    state.timeLeft = 64;
  } else if (shot === 'end') {
    state.phase = PHASES.PLAYING;
    for (let i = 0; i < 7; i++) state.found.add(i);
    state.score = 700;
    state.levelBonus = 435;
    state.score += state.levelBonus;
    state.phase = PHASES.LEVEL_CLEAR;
    state.timeLeft = 87;
  }
  return true;
}
