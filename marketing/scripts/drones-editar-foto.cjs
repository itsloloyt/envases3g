// Edita la foto del show de drones: borra el retrato y dibuja con drones la camiseta 10 + "GRACIAS LEO".
const sharp = require(process.env.SH + '/sharp');
const [SRC, OUT] = process.argv.slice(2);
const S = 2; // se trabaja al doble de resolución
(async () => {
  const meta = await sharp(SRC).metadata();
  const W = meta.width * S, H = meta.height * S;
  const base = await sharp(SRC).resize(W, H, { kernel: 'lanczos3' }).removeAlpha().png().toBuffer();
  // 1) Borrar el retrato: cielo oscuro con la misma textura (tomada de la esquina superior izquierda).
  const skyPatch = await sharp(base).extract({ left: 20, top: 20, width: 300, height: 200 }).resize(W, Math.round(H * 0.77)).blur(30).png().toBuffer();
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="f"><feGaussianBlur stdDeviation="${20 * S}"/></filter></defs><path d="M${170 * S} ${0} H${800 * S} V${430 * S} H${170 * S} Z" fill="#fff" filter="url(#f)"/></svg>`);
  const skyMasked = await sharp(skyPatch).extend({ bottom: H - Math.round(H * 0.77), background: '#000' }).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  // 2) Formación de drones (coordenadas en la foto original, se escalan por S).
  const shirt = 'M405 70 Q484 92 563 70 L640 104 L672 192 L618 214 L602 178 L602 372 Q484 388 366 372 L366 178 L350 214 L296 192 L328 104 Z';
  const star = (cx, cy, r) => { let p = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p += `${i ? 'L' : 'M'}${cx + rr * Math.cos(a)} ${cy + rr * Math.sin(a)}`; } return p + 'Z'; };
  const mw = meta.width, mh = meta.height;
  const m = `<svg xmlns="http://www.w3.org/2000/svg" width="${mw}" height="${mh}"><rect width="100%" height="100%" fill="#000"/>
  <defs><clipPath id="c"><path d="${shirt}"/></clipPath></defs>
  <g clip-path="url(#c)">${Array.from({ length: 9 }, (_, i) => `<rect x="${352 + i * 34}" y="60" width="17" height="340" fill="#ff0000"/><rect x="${369 + i * 34}" y="60" width="17" height="340" fill="#808080"/>`).join('')}</g>
  <path d="${shirt}" fill="none" stroke="#00ff00" stroke-width="6"/>
  <text x="484" y="330" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="700" font-size="170" letter-spacing="-8" fill="#00ff00" stroke="#000" stroke-width="14" paint-order="stroke">10</text>
  <path d="${star(444, 40, 16)}${star(484, 28, 20)}${star(524, 40, 16)}" fill="#0000ff"/>
  <text x="484" y="428" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="700" font-size="44" letter-spacing="3" fill="#00ff00">GRACIAS LEO</text>
  </svg>`;
  const { data } = await sharp(Buffer.from(m)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let seed = 5; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dots = [];
  const STEP = 4.6;
  for (let y = 5; y < 450; y += STEP) for (let x = 250; x < 720; x += STEP) {
    const jx = x + (rnd() - 0.5) * 1.2, jy = y + (rnd() - 0.5) * 1.2;
    const i = (Math.round(jy) * mw + Math.round(jx)) * 3, r = data[i], g = data[i + 1], b = data[i + 2];
    if (b > 128 && r < 60) dots.push([jx, jy, '#ffd36b']);
    else if (g > 200) dots.push([jx, jy, '#ffffff']);
    else if (r > 90 && g > 90 && b > 90) dots.push([jx, jy, '#dfeeff']);
    else if (r > 128) dots.push([jx, jy, '#3f8fff']);
  }
  const svg = (k, op) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${dots.map(([x, y, c]) => `<circle cx="${(x * S).toFixed(1)}" cy="${(y * S).toFixed(1)}" r="${(1.25 * S * k).toFixed(2)}" fill="${c}" opacity="${op}"/>`).join('')}</svg>`;
  const glowBig = await sharp(Buffer.from(svg(3, 0.45))).blur(7 * S).png().toBuffer();
  const glow = await sharp(Buffer.from(svg(1.8, 0.8))).blur(1.6 * S).png().toBuffer();
  const core = await sharp(Buffer.from(svg(1, 1))).png().toBuffer();
  await sharp(base).composite([{ input: skyMasked }, { input: glowBig, blend: 'screen' }, { input: glow, blend: 'screen' }, { input: core }]).jpeg({ quality: 93 }).toFile(OUT);
  console.log('drones', dots.length, W, H);
})();
