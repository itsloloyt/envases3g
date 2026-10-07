"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

/**
 * "Tresi", la mascota de Envases 3G: el logo con brazos de manguera, guantes
 * y zapatillas, al estilo de los dibujos animados retro (tipo Miss Minutes).
 * Aparece abajo a la izquierda, saluda y tira tips cortos.
 */
const TIPS: { text: string; href?: string; cta?: string }[] = [
  { text: "¡Hola! Soy Tresi 👋 ¿Buscás un envase? Te ayudo a encontrarlo.", href: "/productos", cta: "Ver catálogo" },
  { text: "Pagando en efectivo tenés 10% OFF desde 20 unidades. ¡Hasta 20%!", href: "/como-comprar", cta: "Ver descuentos" },
  { text: "Elegí la tapa o válvula en cada producto y mirá cómo queda.", href: "/productos?rubro=accesorios", cta: "Ver accesorios" },
  { text: "¿Dudas? Escribinos por WhatsApp y te respondemos al toque.", href: "/contacto", cta: "Contacto" },
];

export function Mascot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState(0);
  const [hidden, setHidden] = useState(true);
  const [wave, setWave] = useState(0);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem("tresi-off") === "1";
    } catch {}
    if (dismissed) return;
    const show = setTimeout(() => setHidden(false), 2500);
    const talk = setTimeout(() => {
      setOpen(true);
      setWave((w) => w + 1);
    }, 4000);
    return () => {
      clearTimeout(show);
      clearTimeout(talk);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), 9000);
    return () => clearTimeout(t);
  }, [open, tip]);

  if (pathname.startsWith("/administracion") || hidden) return null;

  const close = () => {
    setHidden(true);
    try {
      sessionStorage.setItem("tresi-off", "1");
    } catch {}
  };

  const poke = () => {
    setTip((t) => (open ? (t + 1) % TIPS.length : t));
    setOpen(true);
    setWave((w) => w + 1);
  };

  const t = TIPS[tip];

  return (
    <div className="pointer-events-none fixed bottom-24 left-3 z-[45] flex items-end gap-1 lg:bottom-5 lg:left-5 print:hidden">
      <motion.button
        type="button"
        onClick={poke}
        aria-label="Tresi, la mascota de Envases 3G: tocá para ver un consejo"
        className="pointer-events-auto relative w-[88px] shrink-0 sm:w-[104px]"
        initial={{ y: 160, rotate: -20 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
        whileHover={{ scale: 1.06, rotate: -3 }}
        whileTap={{ scale: 0.92 }}
      >
        <Tresi wave={wave} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key={tip}
            initial={{ opacity: 0, scale: 0.6, x: -20, y: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 6 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            style={{ transformOrigin: "0% 100%" }}
            className="pointer-events-auto relative mb-14 max-w-[230px] rounded-2xl rounded-bl-sm border-2 border-ink bg-white p-3 pr-7 text-[13px] font-medium leading-snug text-ink shadow-[4px_4px_0_0_var(--color-ink,#0d2a2e)]"
          >
            {t.text}
            {t.href && (
              <Link href={t.href} onClick={() => setOpen(false)} className="mt-2 inline-block rounded-full bg-teal px-3 py-1 text-xs font-bold text-night hover:bg-sun">
                {t.cta} →
              </Link>
            )}
            <button type="button" onClick={close} aria-label="Ocultar a Tresi" className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Dibujo de Tresi en SVG, con parpadeo, rebote y saludo. */
function Tresi({ wave }: { wave: number }) {
  const ink = "#0d2a2e";
  return (
    <motion.svg viewBox="0 0 200 250" className="w-full overflow-visible drop-shadow-[0_10px_14px_rgb(4_22_25/0.25)]" animate={{ y: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
      {/* Sombra */}
      <motion.ellipse cx="100" cy="242" rx="52" ry="6" fill={ink} opacity="0.15" animate={{ rx: [52, 44, 52] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />

      {/* Piernas de manguera y zapatillas */}
      <g stroke={ink} strokeWidth="3" strokeLinecap="round">
        <path d="M82 182 C 80 200, 78 212, 76 224" fill="none" stroke="#1ba6b7" strokeWidth="11" />
        <path d="M118 182 C 120 200, 124 212, 126 224" fill="none" stroke="#1ba6b7" strokeWidth="11" />
      </g>
      {[
        { x: 62, flip: 1 },
        { x: 140, flip: -1 },
      ].map(({ x, flip }) => (
        <g key={x} transform={`translate(${x} 226) scale(${flip} 1)`}>
          <path d="M-18 6 C -18 -6, 10 -8, 16 0 L 20 6 Z" fill="#1ba6b7" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
          <path d="M-20 6 H 22 C 22 13, -20 13, -20 6 Z" fill="#fff" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
          <path d="M-6 -2 L 4 -2 M -4 2 L 6 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}

      {/* Brazo derecho en la cintura */}
      <path d="M168 120 C 190 130, 186 160, 166 162" fill="none" stroke="#1ba6b7" strokeWidth="11" strokeLinecap="round" />
      <path d="M168 120 C 190 130, 186 160, 166 162" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <circle cx="164" cy="162" r="11" fill="#fff" stroke={ink} strokeWidth="3" />

      {/* Brazo izquierdo: saluda */}
      <motion.g
        key={wave}
        style={{ transformOrigin: "40px 118px" }}
        animate={wave ? { rotate: [0, -28, 14, -28, 14, 0] } : undefined}
        transition={{ duration: 1.3, ease: "easeInOut" }}
      >
        <path d="M40 118 C 18 108, 12 84, 20 62" fill="none" stroke="#1ba6b7" strokeWidth="11" strokeLinecap="round" />
        {/* Mano abierta saludando (guante blanco, 4 dedos) */}
        <g transform="translate(20 50) rotate(-12)" stroke={ink} strokeWidth="3" strokeLinejoin="round" fill="#fff">
          {[-13, -5, 3, 11].map((x, i) => (
            <rect key={x} x={x - 3.5} y={-30 + Math.abs(i - 1.5) * 3} width="8" height="22" rx="4" />
          ))}
          <rect x="12" y="-6" width="16" height="8" rx="4" transform="rotate(-35 14 -2)" />
          <ellipse cx="0" cy="0" rx="17" ry="14" />
          <path d="M-9 -2 Q 0 4 9 -2" fill="none" strokeWidth="2" />
          <rect x="-14" y="12" width="28" height="7" rx="3.5" />
        </g>
      </motion.g>

      {/* Cuerpo: el logo */}
      <circle cx="100" cy="112" r="76" fill="#0f8f9c" />
      <circle cx="100" cy="108" r="76" fill="#22b5c1" stroke={ink} strokeWidth="4" />
      <circle cx="100" cy="108" r="66" fill="none" stroke="#fff" strokeWidth="3" opacity="0.9" />
      {/* brillo retro */}
      <path d="M50 70 C 62 50, 84 40, 104 40" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.55" />

      {/* Medialuna amarilla del logo */}
      <g transform="translate(112 52)">
        <circle r="17" fill="#ffe34a" stroke={ink} strokeWidth="2.5" />
        <path d="M-17 -4 H 2 M -16 3 H 4 M -13 10 H 2" stroke="#22b5c1" strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* Ojos con pestañas y parpadeo */}
      {[72, 128].map((cx) => (
        <g key={cx}>
          <path d={`M${cx - 15} ${cx < 100 ? 72 : 72} q 15 -12 30 0`} fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx={cx} cy="92" rx="14" ry="17" fill="#fff" stroke={ink} strokeWidth="3" />
          <motion.g style={{ transformOrigin: `${cx}px 94px` }} animate={{ scaleY: [1, 1, 0.08, 1, 1] }} transition={{ duration: 4.2, times: [0, 0.9, 0.93, 0.96, 1], repeat: Infinity }}>
            <ellipse cx={cx + 2} cy="95" rx="7.5" ry="9.5" fill={ink} />
            <circle cx={cx + 5} cy="91" r="2.6" fill="#fff" />
          </motion.g>
          <path d={`M${cx - 12} 79 l -5 -5 M${cx - 6} 76 l -2 -6`} stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}

      {/* Cachetes y sonrisa */}
      <ellipse cx="58" cy="116" rx="8" ry="5" fill="#ff8a8a" opacity="0.55" />
      <ellipse cx="142" cy="116" rx="8" ry="5" fill="#ff8a8a" opacity="0.55" />
      <path d="M80 114 C 86 134, 114 134, 120 114 Z" fill="#7a1f2b" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <path d="M90 126 C 96 120, 106 120, 112 126 C 106 131, 96 131, 90 126 Z" fill="#ff6b6b" />

      {/* Nombre */}
      <text x="100" y="158" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="21" fill="#fff" stroke={ink} strokeWidth="1" paintOrder="stroke" letterSpacing="0.5">
        ENVASES
      </text>
      <text x="100" y="178" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="17" fill="#ffe34a" stroke={ink} strokeWidth="1" paintOrder="stroke">
        3G
      </text>
    </motion.svg>
  );
}
