// Genera la música del reel (sin derechos de autor): intro con riser, "drop" con bombo,
// palmas, hi-hats, bajo con sidechain y whooshes en cada corte.
// Uso: node scripts/beat.mjs <salida.wav> <segundos> <segundo-del-drop> <cortes en segundos separados por coma>
import fs from 'node:fs';

const [out = 'public/audio/beat.wav', secs = '12.5', dropAt = '2', cutsArg = '', semis = '0'] = process.argv.slice(2);
const tr = 2 ** (Number(semis) / 12); // transposición en semitonos, para que cada reel suene distinto
const SR = 44100, N = Math.round(Number(secs) * SR), BPM = 120, beat = 60 / BPM;
const drop = Number(dropAt), cuts = cutsArg.split(',').filter(Boolean).map(Number);
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan); R[i] += v * (1 + pan); } };

// Acordes (La menor → Fa → Do → Sol), un compás cada uno.
const roots = [55, 43.65, 65.41, 49].map((f) => f * tr);
const chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]].map((c) => c.map((f) => f * tr));
const bar = beat * 4;

// Sidechain: el bombo "aplasta" el resto, el bombeo típico de la música de TikTok.
const duck = (t) => { if (t < drop) return 1; const p = ((t - drop) % beat) / beat; return 0.35 + 0.65 * Math.min(1, p * 3.2); };

for (let i = 0; i < N; i++) {
  const t = i / SR, c = Math.floor(t / bar) % 4;
  // Pad: senos desafinados, entra suave.
  const padAmp = 0.05 * Math.min(1, t / 0.8) * duck(t);
  for (const f of chords[c]) add(i, padAmp * (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 1.004 * t)) * 0.5, Math.sin(f) * 0.3);
  if (t >= drop) {
    // Bajo en corcheas con sidechain.
    const f = roots[c] * 2, ph = (t % (beat / 2)) / (beat / 2);
    add(i, 0.16 * duck(t) * Math.tanh(2.2 * Math.sin(2 * Math.PI * f * t)) * Math.exp(-ph * 2));
  }
}

// Bombo, palmas y hats desde el drop; riser y redoble antes.
const hit = (t0, len, fn) => { const s = Math.round(t0 * SR); for (let k = 0; k < len * SR; k++) add(s + k, ...fn(k / SR)); };
for (let t = drop; t < Number(secs) - 0.05; t += beat) {
  hit(t, 0.35, (x) => [0.9 * Math.sin(2 * Math.PI * (45 * x + (110 / 18) * (1 - Math.exp(-18 * x)))) * Math.exp(-x * 9)]);
  const n = Math.round((t - drop) / beat);
  if (n % 2 === 1) hit(t, 0.18, (x) => [0.28 * rnd() * Math.exp(-x * 22), rnd() * 0.2]);
  hit(t + beat / 2, 0.06, (x) => [0.09 * rnd() * Math.exp(-x * 70), 0.4]);
  hit(t + beat / 4, 0.03, (x) => [0.04 * rnd() * Math.exp(-x * 120), -0.4]);
  hit(t + (3 * beat) / 4, 0.03, (x) => [0.04 * rnd() * Math.exp(-x * 120), -0.4]);
}
// Riser de ruido filtrado hacia el drop + golpe grave en el drop.
{
  let lp = 0; const s0 = Math.max(0, drop - 1.6);
  for (let t = s0; t < drop; t += 1 / SR) {
    const p = (t - s0) / (drop - s0), a = 0.02 + p * 0.995;
    lp += a * (rnd() - lp); add(Math.round(t * SR), 0.22 * p * p * lp);
  }
  for (let k = 0; k < 8; k++) hit(drop - beat + (k * beat) / 8, 0.05, (x) => [0.12 * (k / 8) * rnd() * Math.exp(-x * 40)]);
  hit(drop, 1.2, (x) => [0.7 * Math.sin(2 * Math.PI * 38 * x) * Math.exp(-x * 2.6)]);
}
// Whoosh en cada corte: ruido con filtro que barre, centrado en el corte.
for (const c of cuts) {
  let lp = 0; const len = 0.42, s0 = c - len * 0.7;
  for (let k = 0; k < len * SR; k++) {
    const p = k / (len * SR), env = Math.sin(Math.PI * p) ** 2;
    lp += (0.03 + 0.5 * env) * (rnd() - lp);
    add(Math.round(s0 * SR) + k, 0.35 * env * lp, (p - 0.5) * 1.2);
  }
}
// Final: fade out.
for (let i = 0; i < N; i++) { const t = i / SR, f = Math.min(1, (Number(secs) - t) / 0.8); L[i] *= f; R[i] *= f; }

let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / peak, buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.tanh(L[i] * g) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(R[i] * g) * 32767), 46 + i * 4); }
fs.writeFileSync(out, buf);
console.log('Música:', out);
