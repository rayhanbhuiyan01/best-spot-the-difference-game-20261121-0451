// The three scenes. Each scene draws itself twice: once as the original (left panel)
// and once as the changed copy (right panel). The `variant` flag flips the seven
// differences on. Both panels are drawn from the same seed, so the decoration matches
// exactly and only the listed differences differ. Positions are fractions of the panel.
import { mulberry32 } from './random.js';

const TAU = Math.PI * 2;

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Level 1 — Garden Dawn: a sunny garden with a cat, a pond and a lantern post.
// ---------------------------------------------------------------------------
function drawGarden(ctx, W, H, variant, seed) {
  const rng = mulberry32(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#8ec9ee');
  sky.addColorStop(0.6, '#cfeefb');
  sky.addColorStop(1, '#e8f7d9');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sun (difference 1: sunglasses on the right panel).
  circle(ctx, W * 0.15, H * 0.16, 34, '#ffd93b');
  circle(ctx, W * 0.15, H * 0.16, 26, '#ffe98a');
  if (variant) {
    rect(ctx, W * 0.15 - 22, H * 0.16 - 8, 44, 12, '#222');
    line(ctx, W * 0.15 - 22, H * 0.16 - 2, W * 0.15 - 30, H * 0.16 - 6, '#222', 3);
    line(ctx, W * 0.15 + 22, H * 0.16 - 2, W * 0.15 + 30, H * 0.16 - 6, '#222', 3);
  }

  // Clouds (difference 5: an extra cloud on the right panel).
  const clouds = [[0.38, 0.1], [0.72, 0.08]];
  if (variant) clouds.push([0.48, 0.2]);
  for (const [cx, cy] of clouds) {
    circle(ctx, W * cx, H * cy, 22, '#ffffff');
    circle(ctx, W * cx + 20, H * cy + 4, 17, '#ffffff');
    circle(ctx, W * cx - 20, H * cy + 5, 15, '#ffffff');
  }

  // Rolling hills and grass.
  ellipse(ctx, W * 0.25, H * 1.05, W * 0.45, H * 0.35, '#7cc46a');
  ellipse(ctx, W * 0.85, H * 1.08, W * 0.5, H * 0.38, '#6db35e');
  rect(ctx, 0, H * 0.78, W, H * 0.22, '#79c267');

  // Pond (difference 6: a fish swims on the left panel only).
  ellipse(ctx, W * 0.35, H * 0.88, 90, 26, '#5db7d6');
  ellipse(ctx, W * 0.35, H * 0.88, 74, 18, '#79c8e2');
  if (!variant) {
    ellipse(ctx, W * 0.33, H * 0.88, 12, 6, '#ff9f43');
    line(ctx, W * 0.33 + 12, H * 0.88, W * 0.33 + 20, H * 0.88 - 6, '#ff9f43', 3);
    line(ctx, W * 0.33 + 12, H * 0.88, W * 0.33 + 20, H * 0.88 + 6, '#ff9f43', 3);
    circle(ctx, W * 0.31, H * 0.87, 1.6, '#222');
  }

  // Big tree on the right.
  rect(ctx, W * 0.82, H * 0.42, 18, H * 0.36, '#8a5a3b');
  circle(ctx, W * 0.83, H * 0.34, 52, '#3f9e4d');
  circle(ctx, W * 0.76, H * 0.42, 36, '#4cb15a');
  circle(ctx, W * 0.9, H * 0.42, 36, '#379245');
  circle(ctx, W * 0.83, H * 0.26, 30, '#57bd63');

  // Flower bed (difference 3: the middle flower is red on the left, yellow on the right).
  const flowers = [0.12, 0.22, 0.3, 0.48, 0.58, 0.68];
  flowers.forEach((fx, i) => {
    const fy = H * 0.78 + (i % 2) * 8;
    line(ctx, W * fx, fy, W * fx, fy - 16, '#2f7d32', 3);
    const petal = i === 2 ? (variant ? '#ffd93b' : '#ef5350') : ['#ef5350', '#ffd93b', '#ab47bc'][i % 3];
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * TAU;
      circle(ctx, W * fx + Math.cos(a) * 7, fy - 18 + Math.sin(a) * 7, 5, petal);
    }
    circle(ctx, W * fx, fy - 18, 5, '#ff8f00');
  });

  // Butterfly (difference 2: it flutters on the left panel only).
  if (!variant) {
    const bx = W * 0.62;
    const by = H * 0.3;
    ellipse(ctx, bx - 8, by - 4, 9, 6, '#ab47bc');
    ellipse(ctx, bx + 8, by - 4, 9, 6, '#7e57c2');
    ellipse(ctx, bx - 7, by + 6, 7, 5, '#ce93d8');
    ellipse(ctx, bx + 7, by + 6, 7, 5, '#b39ddb');
    line(ctx, bx, by - 8, bx, by + 10, '#333', 2);
  }

  // Cat sitting on the grass (difference 4: tail up on the left, tail down on the right).
  const catX = W * 0.76;
  const catY = H * 0.74;
  ellipse(ctx, catX, catY, 26, 18, '#ff8a65');
  circle(ctx, catX + 16, catY - 18, 14, '#ff8a65');
  line(ctx, catX + 8, catY - 28, catX + 4, catY - 38, '#ff8a65', 6);
  line(ctx, catX + 22, catY - 30, catX + 26, catY - 40, '#ff8a65', 6);
  circle(ctx, catX + 20, catY - 20, 2, '#222');
  circle(ctx, catX + 12, catY - 20, 2, '#222');
  if (variant) {
    line(ctx, catX - 24, catY + 6, catX - 38, catY + 16, '#ff8a65', 6);
  } else {
    line(ctx, catX - 24, catY + 4, catX - 38, catY - 16, '#ff8a65', 6);
  }

  // Lantern post (difference 7: lit on the left, dark on the right).
  line(ctx, W * 0.88, H * 0.45, W * 0.88, H * 0.78, '#5d4037', 5);
  rect(ctx, W * 0.88 - 14, H * 0.4, 28, 22, variant ? '#78909c' : '#ffb300');
  if (!variant) {
    circle(ctx, W * 0.88, H * 0.51, 26, 'rgba(255, 213, 79, 0.35)');
    circle(ctx, W * 0.88, H * 0.51, 6, '#fff8e1');
  }

  // Grass tufts, identical on both panels because the rng is re-seeded per draw.
  for (let i = 0; i < 26; i++) {
    const gx = rng() * W;
    const gy = H * 0.8 + rng() * H * 0.18;
    line(ctx, gx, gy, gx - 3, gy - 7, '#4c9a3f', 2);
    line(ctx, gx + 3, gy, gx + 6, gy - 6, '#4c9a3f', 2);
  }
}

// ---------------------------------------------------------------------------
// Level 2 — Riverside Picnic: a blanket by the river, a kite and ducks.
// ---------------------------------------------------------------------------
function drawPicnic(ctx, W, H, variant, seed) {
  const rng = mulberry32(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#aee3f5');
  sky.addColorStop(1, '#fdf3d0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Sun (difference 7: rays on the left panel only).
  circle(ctx, W * 0.88, H * 0.14, 26, '#ffd93b');
  if (!variant) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      line(ctx, W * 0.88 + Math.cos(a) * 32, H * 0.14 + Math.sin(a) * 32,
        W * 0.88 + Math.cos(a) * 42, H * 0.14 + Math.sin(a) * 42, '#ffb300', 3);
    }
  }

  // Kite (difference 1: red on the left, blue on the right).
  const kiteColor = variant ? '#42a5f5' : '#ef5350';
  const kx = W * 0.7;
  const ky = H * 0.18;
  ctx.fillStyle = kiteColor;
  ctx.beginPath();
  ctx.moveTo(kx, ky - 22);
  ctx.lineTo(kx + 18, ky);
  ctx.lineTo(kx, ky + 22);
  ctx.lineTo(kx - 18, ky);
  ctx.closePath();
  ctx.fill();
  line(ctx, kx, ky + 22, kx - 30, ky + 70, '#8d6e63', 2);
  circle(ctx, kx - 12, ky + 40, 4, '#ffd93b');
  circle(ctx, kx - 22, ky + 56, 4, '#ffd93b');

  // Tree on the left (difference 5: a little bird perches on the left only).
  rect(ctx, W * 0.1, H * 0.3, 16, H * 0.3, '#8a5a3b');
  circle(ctx, W * 0.11, H * 0.22, 44, '#43a047');
  circle(ctx, W * 0.05, H * 0.3, 28, '#66bb6a');
  circle(ctx, W * 0.17, H * 0.3, 28, '#388e3c');
  if (!variant) {
    ellipse(ctx, W * 0.12, H * 0.28, 10, 7, '#5d4037');
    circle(ctx, W * 0.16, H * 0.26, 5, '#5d4037');
    line(ctx, W * 0.2, H * 0.26, W * 0.2 + 7, H * 0.27, '#ff8f00', 2);
  }

  // River across the bottom third; the bank above it holds the blanket.
  rect(ctx, 0, H * 0.7, W, H * 0.3, '#4db6d6');
  for (let i = 0; i < 8; i++) {
    const wy = H * 0.72 + i * 12;
    const off = (i % 2) * 40;
    line(ctx, 20 + off, wy, 90 + off, wy, 'rgba(255,255,255,0.55)', 2);
    line(ctx, 200 + off, wy, 280 + off, wy, 'rgba(255,255,255,0.55)', 2);
    line(ctx, 380 + off, wy, 460 + off, wy, 'rgba(255,255,255,0.55)', 2);
  }

  // Ducks (difference 2: two ducks on the left, three on the right).
  const ducks = [[0.42, 0.74], [0.58, 0.82]];
  if (variant) ducks.push([0.68, 0.74]);
  for (const [dx, dy] of ducks) {
    ellipse(ctx, W * dx, H * dy, 16, 10, '#fffde7');
    circle(ctx, W * dx + 14, H * dy - 8, 8, '#fffde7');
    circle(ctx, W * dx + 16, H * dy - 9, 1.6, '#222');
    ellipse(ctx, W * dx + 22, H * dy - 7, 6, 3, '#ff8f00');
  }

  // Little boat (difference 4: a flag flies on the left only).
  const boatX = W * 0.82;
  const boatY = H * 0.76;
  ctx.fillStyle = '#8d6e63';
  ctx.beginPath();
  ctx.moveTo(boatX - 34, boatY);
  ctx.lineTo(boatX + 34, boatY);
  ctx.lineTo(boatX + 22, boatY + 16);
  ctx.lineTo(boatX - 22, boatY + 16);
  ctx.closePath();
  ctx.fill();
  line(ctx, boatX, boatY, boatX, boatY - 30, '#6d4c41', 3);
  if (!variant) {
    ctx.fillStyle = '#ef5350';
    ctx.beginPath();
    ctx.moveTo(boatX, boatY - 30);
    ctx.lineTo(boatX + 20, boatY - 24);
    ctx.lineTo(boatX, boatY - 18);
    ctx.closePath();
    ctx.fill();
  }

  // Picnic blanket on the bank (difference 6: red checks on the left, green on the right).
  const bx = W * 0.2;
  const by = H * 0.5;
  const check = variant ? '#66bb6a' : '#ef5350';
  rect(ctx, bx, by, 130, 84, '#fff8e1');
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      if ((r + c) % 2 === 0) rect(ctx, bx + c * 32.5, by + r * 28, 32.5, 28, check);
    }
  }
  line(ctx, bx, by, bx + 130, by + 84, '#d7ccc8', 2);

  // Basket and apple (difference 3: the apple sits on the blanket on the left only).
  ellipse(ctx, bx + 100, by + 30, 26, 18, '#a1887f');
  rect(ctx, bx + 78, by + 8, 44, 8, '#8d6e63');
  if (!variant) {
    circle(ctx, bx + 24, by + 44, 10, '#e53935');
    line(ctx, bx + 24, by + 34, bx + 28, by + 26, '#2e7d32', 2);
  }
  // Sandwich and cup on the blanket.
  rect(ctx, bx + 44, by + 52, 22, 14, '#ffe0b2');
  line(ctx, bx + 44, by + 52, bx + 66, by + 66, '#e65100', 2);
  rect(ctx, bx + 96, by + 56, 14, 18, '#4fc3f7');

  // Butterflies and flowers on the bank, identical on both panels.
  for (let i = 0; i < 10; i++) {
    const fx = 30 + rng() * (W - 60);
    const fy = H * 0.44 + rng() * H * 0.05;
    circle(ctx, fx, fy, 3, ['#ef5350', '#ffd93b', '#ab47bc'][i % 3]);
  }
}

// ---------------------------------------------------------------------------
// Level 3 — Night Market: lantern-lit stalls under a big moon.
// ---------------------------------------------------------------------------
function drawMarket(ctx, W, H, variant, seed) {
  const rng = mulberry32(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#1a237e');
  sky.addColorStop(0.7, '#3949ab');
  sky.addColorStop(1, '#5c6bc0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars (difference 6: one extra star on the right panel).
  for (let i = 0; i < 22; i++) {
    const sx = rng() * W;
    const sy = rng() * H * 0.3;
    circle(ctx, sx, sy, 1.5 + rng() * 1.5, '#fffde7');
  }
  if (variant) circle(ctx, W * 0.65, H * 0.1, 3, '#fffde7');

  // Moon (difference 1: full on the left, crescent on the right).
  circle(ctx, W * 0.85, H * 0.15, 30, '#fff9c4');
  if (variant) circle(ctx, W * 0.87, H * 0.13, 26, '#3949ab');

  // String of lanterns (difference 4: the middle lantern is missing on the right).
  line(ctx, W * 0.05, H * 0.24, W * 0.95, H * 0.2, '#3e2723', 2);
  const lanternXs = [0.14, 0.27, 0.4, 0.53, 0.66, 0.79, 0.9];
  lanternXs.forEach((lx, i) => {
    if (variant && i === 2) return;
    const ly = H * (0.235 - i * 0.002);
    line(ctx, W * lx, ly - 14, W * lx, ly, '#3e2723', 2);
    ellipse(ctx, W * lx, ly + 4, 11, 14, ['#ff7043', '#ffd54f', '#ef5350'][i % 3]);
    rect(ctx, W * lx - 4, ly - 12, 8, 4, '#ffca28');
  });

  // Balloons (difference 2: red on the left, purple on the right).
  const balloon = variant ? '#ab47bc' : '#ef5350';
  const bxx = W * 0.2;
  const byy = H * 0.3;
  ellipse(ctx, bxx, byy, 18, 23, balloon);
  ellipse(ctx, bxx + 26, byy + 10, 15, 19, '#42a5f5');
  line(ctx, bxx, byy + 23, bxx - 8, byy + 60, '#e0e0e0', 2);
  line(ctx, bxx + 26, byy + 29, bxx + 34, byy + 60, '#e0e0e0', 2);

  // Left stall with striped awning.
  rect(ctx, W * 0.06, H * 0.52, 150, 110, '#8d6e63');
  for (let i = 0; i < 5; i++) {
    rect(ctx, W * 0.06 + i * 30, H * 0.46, 30, 26, i % 2 ? '#fff8e1' : '#e53935');
  }
  rect(ctx, W * 0.06, H * 0.62, 150, 8, '#6d4c41');
  circle(ctx, W * 0.06 + 30, H * 0.68, 8, '#ff7043');
  circle(ctx, W * 0.06 + 60, H * 0.68, 8, '#ffd54f');
  circle(ctx, W * 0.06 + 90, H * 0.68, 8, '#66bb6a');
  circle(ctx, W * 0.06 + 120, H * 0.68, 8, '#ab47bc');

  // Stall sign (difference 5: a teacup on the left, a star on the right).
  rect(ctx, W * 0.28, H * 0.44, 56, 30, '#fff8e1');
  if (variant) {
    ctx.fillStyle = '#ff8f00';
    ctx.beginPath();
    for (let p = 0; p < 5; p++) {
      const a = -Math.PI / 2 + (p / 5) * TAU;
      const a2 = a + TAU / 10;
      ctx.lineTo(W * 0.28 + 28 + Math.cos(a) * 11, H * 0.44 + 15 + Math.sin(a) * 11);
      ctx.lineTo(W * 0.28 + 28 + Math.cos(a2) * 5, H * 0.44 + 15 + Math.sin(a2) * 5);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W * 0.28 + 26, H * 0.44 + 15, 8, 0, TAU);
    ctx.stroke();
    line(ctx, W * 0.28 + 34, H * 0.44 + 12, W * 0.28 + 40, H * 0.44 + 15, '#5d4037', 3);
  }

  // Right stall.
  rect(ctx, W * 0.6, H * 0.52, 150, 110, '#795548');
  for (let i = 0; i < 5; i++) {
    rect(ctx, W * 0.6 + i * 30, H * 0.46, 30, 26, i % 2 ? '#fff8e1' : '#1e88e5');
  }
  rect(ctx, W * 0.6, H * 0.62, 150, 8, '#4e342e');
  rect(ctx, W * 0.6 + 20, H * 0.68, 30, 20, '#ffb300');
  rect(ctx, W * 0.6 + 60, H * 0.68, 30, 20, '#8bc34a');
  rect(ctx, W * 0.6 + 100, H * 0.68, 30, 20, '#ec407a');

  // Cat on the left stall roof (difference 3: it sits there on the left only).
  if (!variant) {
    const cx = W * 0.55;
    const cy = H * 0.44;
    ellipse(ctx, cx, cy, 20, 12, '#37474f');
    circle(ctx, cx + 14, cy - 10, 10, '#37474f');
    line(ctx, cx + 8, cy - 18, cx + 6, cy - 26, '#37474f', 4);
    line(ctx, cx + 18, cy - 19, cx + 20, cy - 27, '#37474f', 4);
    line(ctx, cx - 18, cy + 4, cx - 30, cy - 8, '#37474f', 4);
  }

  // Cart at the bottom right (difference 7: a wheel on the left only).
  rect(ctx, W * 0.68, H * 0.78, 110, 40, '#a1887f');
  rect(ctx, W * 0.68, H * 0.74, 110, 10, '#8d6e63');
  circle(ctx, W * 0.7, H * 0.84, 10, '#ff7043');
  circle(ctx, W * 0.7, H * 0.84, 10, '#ff7043');
  if (!variant) {
    circle(ctx, W * 0.78, H * 0.86, 12, '#37474f');
    circle(ctx, W * 0.78, H * 0.86, 5, '#b0bec5');
  }
  circle(ctx, W * 0.86, H * 0.86, 12, '#37474f');
  circle(ctx, W * 0.86, H * 0.86, 5, '#b0bec5');

  // Ground.
  rect(ctx, 0, H * 0.9, W, H * 0.1, '#3e2723');
  for (let i = 0; i < 12; i++) {
    const px = rng() * W;
    circle(ctx, px, H * 0.93 + rng() * H * 0.05, 2, '#8d6e63');
  }
}

export const SCENES = [
  {
    id: 'garden',
    name: 'Garden Dawn',
    subtitle: 'A sunny garden — find what changed',
    seed: 101,
    timeLimit: 120,
    draw: drawGarden,
    differences: [
      { id: 'sun-glasses', x: 0.15, y: 0.16, r: 0.075, name: 'The sun wears sunglasses' },
      { id: 'butterfly', x: 0.62, y: 0.3, r: 0.07, name: 'The butterfly is gone' },
      { id: 'flower', x: 0.3, y: 0.76, r: 0.06, name: 'A flower changed colour' },
      { id: 'cat-tail', x: 0.72, y: 0.72, r: 0.07, name: "The cat's tail dropped" },
      { id: 'cloud', x: 0.48, y: 0.2, r: 0.07, name: 'An extra cloud appeared' },
      { id: 'fish', x: 0.33, y: 0.88, r: 0.07, name: 'The fish vanished' },
      { id: 'lantern', x: 0.88, y: 0.47, r: 0.07, name: 'The lantern went dark' },
    ],
  },
  {
    id: 'picnic',
    name: 'Riverside Picnic',
    subtitle: 'Lunch by the river — spot every change',
    seed: 202,
    timeLimit: 120,
    draw: drawPicnic,
    differences: [
      { id: 'kite', x: 0.7, y: 0.18, r: 0.075, name: 'The kite changed colour' },
      { id: 'ducks', x: 0.68, y: 0.74, r: 0.07, name: 'A third duck joined' },
      { id: 'apple', x: 0.24, y: 0.6, r: 0.06, name: 'The apple is missing' },
      { id: 'flag', x: 0.84, y: 0.72, r: 0.06, name: 'The boat lost its flag' },
      { id: 'bird', x: 0.13, y: 0.28, r: 0.06, name: 'The bird flew away' },
      { id: 'blanket', x: 0.28, y: 0.6, r: 0.075, name: 'The blanket changed colour' },
      { id: 'rays', x: 0.88, y: 0.14, r: 0.07, name: "The sun's rays are gone" },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    subtitle: 'Lanterns and stalls after dark',
    seed: 303,
    timeLimit: 150,
    draw: drawMarket,
    differences: [
      { id: 'moon', x: 0.85, y: 0.15, r: 0.075, name: 'The moon turned crescent' },
      { id: 'balloon', x: 0.2, y: 0.3, r: 0.07, name: 'The balloon changed colour' },
      { id: 'cat', x: 0.55, y: 0.42, r: 0.07, name: 'The cat left the roof' },
      { id: 'lantern', x: 0.4, y: 0.23, r: 0.06, name: 'A lantern is missing' },
      { id: 'sign', x: 0.315, y: 0.49, r: 0.06, name: 'The stall sign changed' },
      { id: 'star', x: 0.65, y: 0.1, r: 0.06, name: 'A new star appeared' },
      { id: 'wheel', x: 0.78, y: 0.86, r: 0.06, name: 'The cart lost a wheel' },
    ],
  },
];
