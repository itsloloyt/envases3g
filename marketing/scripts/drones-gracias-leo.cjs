// Show de drones "Gracias Leo": se dibuja una máscara de colores y se muestrea en una grilla de puntos de luz.
const sharp = require(process.env.SH + '/sharp');
const fs = require('fs');
const W = 1080, H = 1350, OUT = process.argv[2];
const shirt = 'M380 300 Q540 340 700 300 L840 360 L900 520 L800 560 L770 490 L770 900 Q540 930 310 900 L310 490 L280 560 L180 520 L240 360 Z';
const star = (cx, cy, r) => { let p = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p += `${i ? 'L' : 'M'}${cx + rr * Math.cos(a)} ${cy + rr * Math.sin(a)}`; } return p + 'Z'; };
// rojo = celeste, verde = blanco, azul = dorado
const mask = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect width="100%" height="100%" fill="#000"/>
<defs><clipPath id="c"><path d="${shirt}"/></clipPath></defs>
<g clip-path="url(#c)">${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${300 + i * 80}" y="280" width="40" height="680" fill="#ff0000"/><rect x="${340 + i * 80}" y="280" width="40" height="680" fill="#808080"/>`).join('')}</g>
<path d="${shirt}" fill="none" stroke="#00ff00" stroke-width="16"/>
<text x="540" y="840" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="700" font-size="400" letter-spacing="-20" fill="#00ff00" stroke="#000" stroke-width="34" paint-order="stroke">10</text>
<path d="${star(445, 210, 46)}${star(540, 180, 58)}${star(635, 210, 46)}" fill="#0000ff"/>
<text x="540" y="1060" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="700" font-size="128" letter-spacing="4" fill="#00ff00">GRACIAS LEO</text>
</svg>`;
(async () => {
  const { data } = await sharp(Buffer.from(mask)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => { const i = (Math.round(y) * W + Math.round(x)) * 3; return [data[i], data[i + 1], data[i + 2]]; };
  let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const dots = [];
  const STEP = 11;
  for (let y = 150; y < 1100; y += STEP) for (let x = 120; x < 960; x += STEP) {
    const jx = x + (rnd() - 0.5) * 3, jy = y + (rnd() - 0.5) * 3;
    const [r, g, b] = px(jx, jy);
    if (b > 128 && r < 60) dots.push([jx, jy, '#ffd36b', 3.2]);
    else if (g > 200) dots.push([jx, jy, '#ffffff', 3.1]);
    else if (r > 90 && g > 90 && b > 90) dots.push([jx, jy, '#eaf4ff', 2.4]);
    else if (r > 128) dots.push([jx, jy, '#4aa3ff', 3.0]);
  }
  const dotSvg = (scaleR, op) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${dots.map(([x, y, c, r]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * scaleR).toFixed(1)}" fill="${c}" opacity="${op}"/>`).join('')}</svg>`;
  // Fondo: cielo, estrellas tenues, estadio con luces y público.
  const stars = Array.from({ length: 160 }, () => `<circle cx="${rnd() * W}" cy="${rnd() * 1050}" r="${rnd() * 1.1 + 0.3}" fill="#fff" opacity="${0.15 + rnd() * 0.35}"/>`).join('');
  const rim = Array.from({ length: 70 }, (_, i) => { const x = i * 16 - 10, y = 1175 - Math.sin((i / 69) * Math.PI) * 40; return `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/>`; }).join('');
  const phones = Array.from({ length: 120 }, () => `<circle cx="${rnd() * W}" cy="${1230 + rnd() * 110}" r="${rnd() * 2 + 1}" fill="#cfe6ff" opacity="${0.4 + rnd() * 0.5}"/>`).join('');
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
   <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02040a"/><stop offset=".7" stop-color="#071226"/><stop offset="1" stop-color="#0d1a33"/></linearGradient>
   <radialGradient id="haze" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#3a6ea8" stop-opacity=".25"/><stop offset="1" stop-color="#3a6ea8" stop-opacity="0"/></radialGradient>
   <linearGradient id="glowband" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6e0" stop-opacity="0"/><stop offset=".5" stop-color="#fff6e0" stop-opacity=".55"/><stop offset="1" stop-color="#fff6e0" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#sky)"/>${stars}
  <rect width="100%" height="1100" fill="url(#haze)"/>
  <rect x="0" y="1110" width="${W}" height="140" fill="url(#glowband)"/>
  <path d="M0 1190 Q540 1140 1080 1190 L1080 1350 L0 1350 Z" fill="#05070c"/>
  ${rim}${phones}
  </svg>`;
  const bgBuf = await sharp(Buffer.from(bg)).png().toBuffer();
  const glowBig = await sharp(Buffer.from(dotSvg(3.2, 0.5))).blur(14).png().toBuffer();
  const glowMid = await sharp(Buffer.from(dotSvg(1.8, 0.8))).blur(4).png().toBuffer();
  const core = await sharp(Buffer.from(dotSvg(1, 1))).png().toBuffer();
  const rimGlow = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${rim.replace(/r="5"/g, 'r="16"')}</svg>`)).blur(18).png().toBuffer();
  const logo = await sharp(process.env.LOGO).resize(86).png().toBuffer();
  const footer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><text x="${W / 2 + 34}" y="1316" text-anchor="middle" font-family="Bricolage Grotesque" font-size="26" letter-spacing="3" fill="#e9eef7" opacity=".85">ENVASES 3G · MAR DEL PLATA</text></svg>`);
  await sharp(bgBuf).composite([
    { input: rimGlow, blend: 'screen' }, { input: glowBig, blend: 'screen' }, { input: glowMid, blend: 'screen' }, { input: core },
    { input: logo, left: 230, top: 1262 }, { input: footer },
  ]).png().toFile(OUT);
  console.log('drones:', dots.length);
})();
