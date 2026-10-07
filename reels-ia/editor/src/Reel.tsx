import React from 'react';
import {
  AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';

export type Palabra = {w: string; start: number; end: number};
export type Escena = {start: number; end: number};
export type ReelProps = {
  duracion: number;
  video: string;
  herramienta: string;
  descripcion: string;
  dominio: string;
  web: null | {img: string; ancho: number; alto: number; boton: null | {x: number; y: number; w: number; h: number}};
  gancho: string;
  ganchoFin: number;
  palabras: Palabra[];
  enfasis: string[];
  escenas: Escena[];
  ctaInicio: number;
  ctaTexto: string;
  musica: string | null;
  volumenMusica: number;
  clic: string | null;
};

export const defaultProps: ReelProps = {
  duracion: 15, video: 'bruto.mp4', herramienta: 'Herramienta', descripcion: '', dominio: '',
  web: null, gancho: 'Gancho', ganchoFin: 3, palabras: [], enfasis: [], escenas: [],
  ctaInicio: 12, ctaTexto: 'Guárdalo para probarla', musica: null, volumenMusica: 0.12, clic: null,
};

const C = {
  fondo: '#07080c', panel: '#12141c', borde: 'rgba(255,255,255,0.08)',
  texto: '#ffffff', acento: '#b6ff3b', acento2: '#7c5cff', gris: '#9aa0b4',
};
const FUENTE = '"Inter", "Montserrat", "Helvetica Neue", "Arial Black", Arial, sans-serif';
const ALTO_WEB = Math.round(1920 * 0.48); // ~48 % superior
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]/g, '');

// ---------- Parte superior: web de la herramienta ----------
const Cursor: React.FC<{x: number; y: number; pulsando: number}> = ({x, y, pulsando}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${1 - pulsando * 0.18})`, transformOrigin: '0 0', zIndex: 5}}>
    <svg width="54" height="54" viewBox="0 0 24 24">
      <path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.7 L11.6 14 L18 14 Z" fill="#fff" stroke="#000" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  </div>
);

const Web: React.FC<{p: ReelProps; t: number; anchoCaja: number; altoCaja: number}> = ({p, t, anchoCaja, altoCaja}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const barra = 64;
  const altoVista = altoCaja - barra;
  const chrome = (
    <div style={{height: barra, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px', background: '#1b1e29', borderBottom: `1px solid ${C.borde}`}}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />)}
      <div style={{flex: 1, marginLeft: 14, height: 38, borderRadius: 19, background: '#0d0f16', color: C.gris, fontSize: 22, display: 'flex', alignItems: 'center', padding: '0 20px', fontFamily: FUENTE}}>
        {p.dominio}
      </div>
    </div>
  );

  if (!p.web) {
    // Rótulo de respaldo si la captura falló
    const s = spring({frame, fps, config: {damping: 14}});
    return (
      <div style={{width: anchoCaja, height: altoCaja, borderRadius: 34, overflow: 'hidden', background: `linear-gradient(140deg, ${C.acento2}, #1a1d2b 70%)`, border: `1px solid ${C.borde}`}}>
        {chrome}
        <div style={{height: altoVista, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 60, transform: `scale(${0.9 + s * 0.1})`}}>
          <div style={{fontFamily: FUENTE, fontWeight: 900, fontSize: 110, color: C.texto, lineHeight: 1}}>{p.herramienta}</div>
          <div style={{fontFamily: FUENTE, fontWeight: 600, fontSize: 46, color: '#dfe3f5', marginTop: 30, lineHeight: 1.25}}>{p.descripcion}</div>
        </div>
      </div>
    );
  }

  // La captura se escala al ancho de la caja
  const escala = anchoCaja / p.web.ancho;
  const altoImg = p.web.alto * escala;
  const b = p.web.boton;
  const bx = b ? (b.x + b.w / 2) * anchoCaja : anchoCaja * 0.5;
  const by = b ? (b.y + b.h / 2) * altoImg : altoVista * 0.45;
  // Línea de tiempo: 0-1.2 s reposo con ligero scroll, 1.2-2.6 s cursor viaja, 2.7 s clic, después zoom suave
  const tViaje = interpolate(t, [1.2, 2.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const tClic = 2.75;
  const pulsando = interpolate(t, [tClic - 0.1, tClic, tClic + 0.15], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const zoom = interpolate(t, [tClic, tClic + 1.2, p.duracion], [1, 1.35, 1.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  // Desplazamiento para que el botón quede visible
  const scrollMax = Math.max(0, altoImg - altoVista);
  const scroll = Math.min(scrollMax, Math.max(0, by - altoVista * 0.55));
  const desp = interpolate(t, [0, 1.6], [0, scroll], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const cx = interpolate(tViaje, [0, 1], [anchoCaja * 0.82, bx]);
  const cy = interpolate(tViaje, [0, 1], [altoVista * 0.9 + desp, by]);
  const onda = interpolate(t, [tClic, tClic + 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div style={{width: anchoCaja, height: altoCaja, borderRadius: 34, overflow: 'hidden', background: '#fff', border: `1px solid ${C.borde}`, boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}}>
      {chrome}
      <div style={{position: 'relative', width: anchoCaja, height: altoVista, overflow: 'hidden', background: '#fff'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: anchoCaja, height: altoImg, transform: `translateY(${-desp}px) scale(${zoom})`, transformOrigin: `${bx}px ${by}px`}}>
          <Img src={staticFile(p.web.img)} style={{width: anchoCaja, height: altoImg, display: 'block'}} />
          {onda > 0 && onda < 1 && (
            <div style={{position: 'absolute', left: bx - 90 * onda, top: by - 90 * onda, width: 180 * onda, height: 180 * onda, borderRadius: '50%', border: `6px solid ${C.acento}`, opacity: 1 - onda}} />
          )}
          <Cursor x={cx} y={cy} pulsando={pulsando} />
        </div>
      </div>
    </div>
  );
};

// ---------- Parte inferior: presentador con cortes y zooms ----------
const Presentador: React.FC<{p: ReelProps; t: number; alto: number; desenfoque?: number}> = ({p, t, alto, desenfoque = 0}) => {
  const idx = Math.max(0, p.escenas.findIndex((e) => t >= e.start && t < e.end));
  const escena = p.escenas[idx] || {start: 0, end: p.duracion};
  // Cortes de cámara: alternamos plano medio / plano cerrado en cada escena
  const cerrado = idx % 2 === 1;
  const base = cerrado ? 1.28 : 1.06;
  const local = t - escena.start;
  const empuje = interpolate(local, [0, Math.max(0.5, escena.end - escena.start)], [0, 0.06], {extrapolateRight: 'clamp'});
  // Pequeño "punch-in" en palabras de énfasis
  const enf = new Set(p.enfasis.flatMap((e) => e.split(/\s+/).map(norm)));
  const activa = p.palabras.find((w) => t >= w.start && t < w.end + 0.05);
  const punch = activa && enf.has(norm(activa.w)) ? interpolate(t - activa.start, [0, 0.12, 0.5], [0, 0.05, 0.03], {extrapolateRight: 'clamp'}) : 0;
  const origenY = cerrado ? '30%' : '40%';
  return (
    <div style={{position: 'absolute', inset: 0, height: alto, overflow: 'hidden'}}>
      <OffthreadVideo
        src={staticFile(p.video)}
        style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 22%', transform: `scale(${base + empuje + punch})`, transformOrigin: `50% ${origenY}`, filter: desenfoque ? `blur(${desenfoque}px) brightness(0.55)` : undefined}}
      />
    </div>
  );
};

// ---------- Textos ----------
const Marcado: React.FC<{texto: string; color: string}> = ({texto, color}) => (
  <>
    {texto.split('\n').map((linea, i) => (
      <div key={i}>
        {linea.split(/(\*[^*]+\*)/).map((trozo, j) =>
          trozo.startsWith('*') ? <span key={j} style={{color}}>{trozo.slice(1, -1)}</span> : <span key={j}>{trozo}</span>,
        )}
      </div>
    ))}
  </>
);

const Gancho: React.FC<{p: ReelProps; t: number}> = ({p, t}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (t > p.ganchoFin) return null;
  const s = spring({frame, fps, config: {damping: 12, mass: 0.6}});
  const salida = interpolate(t, [p.ganchoFin - 0.25, p.ganchoFin], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: ALTO_WEB - 210, display: 'flex', justifyContent: 'center', opacity: salida, transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -4}deg)`, zIndex: 10}}>
      <div style={{background: C.texto, color: C.fondo, fontFamily: FUENTE, fontWeight: 900, fontSize: 104, lineHeight: 1.02, letterSpacing: -3, textAlign: 'center', padding: '28px 44px', borderRadius: 30, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textTransform: 'uppercase'}}>
        <Marcado texto={p.gancho} color={C.acento2} />
      </div>
    </div>
  );
};

const Subtitulos: React.FC<{p: ReelProps; t: number}> = ({p, t}) => {
  if (t < p.ganchoFin - 0.1 || t >= p.ctaInicio) return null;
  // Grupos de hasta 3 palabras; se muestra el grupo de la palabra activa
  const grupos: Palabra[][] = [];
  p.palabras.forEach((w, i) => {
    const ult = grupos[grupos.length - 1];
    const corte = !ult || ult.length >= 3 || /[.,;:!?]$/.test(p.palabras[i - 1]?.w || '');
    if (corte) grupos.push([w]); else ult.push(w);
  });
  const g = grupos.find((gr) => t >= gr[0].start - 0.05 && t < (gr[gr.length - 1].end + 0.25));
  if (!g) return null;
  const enf = new Set(p.enfasis.flatMap((e) => e.split(/\s+/).map(norm)));
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1500, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 20px', zIndex: 10}}>
      {g.map((w, i) => {
        const activa = t >= w.start && t < w.end + 0.05;
        const esEnf = enf.has(norm(w.w));
        const pop = activa ? interpolate(t - w.start, [0, 0.08], [0.85, 1.08], {extrapolateRight: 'clamp'}) : 1;
        return (
          <span key={i} style={{
            fontFamily: FUENTE, fontWeight: 900, fontSize: 92, letterSpacing: -2, textTransform: 'uppercase',
            color: activa ? C.fondo : esEnf ? C.acento : C.texto,
            background: activa ? (esEnf ? C.acento : C.texto) : 'transparent',
            padding: '2px 16px', borderRadius: 16, transform: `scale(${pop})`,
            textShadow: activa ? 'none' : '0 6px 24px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.9)',
          }}>{w.w.replace(/[.,;:]$/, '')}</span>
        );
      })}
    </div>
  );
};

const Cierre: React.FC<{p: ReelProps; t: number}> = ({p, t}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - Math.round(p.ctaInicio * fps), fps, config: {damping: 13}});
  return (
    <AbsoluteFill style={{background: C.fondo}}>
      <Presentador p={p} t={t} alto={1920} desenfoque={28} />
      <div style={{position: 'absolute', left: 70, top: 260, transform: `translateY(${(1 - s) * 80}px) scale(${0.92 + s * 0.08})`, opacity: s}}>
        <Web p={p} t={t - p.ctaInicio + 3} anchoCaja={940} altoCaja={760} />
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1110, textAlign: 'center', fontFamily: FUENTE, fontWeight: 900, fontSize: 100, lineHeight: 1.03, letterSpacing: -3, color: C.texto, textTransform: 'uppercase', opacity: s, transform: `scale(${0.8 + s * 0.2})`}}>
        {p.ctaTexto}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1520, display: 'flex', justifyContent: 'center', opacity: s}}>
        <div style={{background: C.acento, color: C.fondo, fontFamily: FUENTE, fontWeight: 900, fontSize: 54, padding: '22px 48px', borderRadius: 60}}>{p.herramienta}</div>
      </div>
    </AbsoluteFill>
  );
};

export const Reel: React.FC<ReelProps> = (p) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const altoInf = 1920 - ALTO_WEB;
  const cambio = p.escenas.some((e) => e.start > 0 && t >= e.start && t < e.start + 0.08);
  return (
    <AbsoluteFill style={{background: C.fondo}}>
      {t < p.ctaInicio ? (
        <>
          <div style={{position: 'absolute', left: 0, top: ALTO_WEB, width: 1080, height: altoInf}}>
            <Presentador p={p} t={t} alto={altoInf} />
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(7,8,12,0.85) 0%, rgba(7,8,12,0) 18%, rgba(7,8,12,0) 70%, rgba(7,8,12,0.55) 100%)'}} />
          </div>
          <div style={{position: 'absolute', left: 30, top: 30}}>
            <Web p={p} t={t} anchoCaja={1020} altoCaja={ALTO_WEB - 50} />
          </div>
          {cambio && <AbsoluteFill style={{background: '#fff', opacity: 0.12}} />}
        </>
      ) : (
        <Cierre p={p} t={t} />
      )}
      <Gancho p={p} t={t} />
      <Subtitulos p={p} t={t} />
      {/* Audio: la voz va dentro de OffthreadVideo; música y clics aparte */}
      {p.musica && <Audio src={staticFile(p.musica)} volume={(f) => p.volumenMusica * interpolate(f, [0, 15, p.duracion * fps - 20, p.duracion * fps], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />}
      {p.clic && [...p.escenas.filter((e) => e.start > 0).map((e) => e.start), p.ctaInicio, 2.75].map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s * fps) - 1)} durationInFrames={10}>
          <Audio src={staticFile(p.clic)} volume={0.35} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
