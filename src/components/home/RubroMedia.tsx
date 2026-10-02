"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useReducedMotion } from "@/lib/reduced-motion";

/**
 * Foto del rubro con video encima: se reproduce al pasar el mouse (computadora)
 * o al entrar en pantalla (celular), con un fundido suave.
 */
export function RubroMedia({ image, video }: { image: string | null; video?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.6 });
  const [playing, setPlaying] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTouch(window.matchMedia("(hover: none)").matches);
  }, []);

  useEffect(() => {
    if (!video || reduce || !touch) return;
    const v = vid.current;
    if (!v) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView, touch, video, reduce]);

  const hoverProps =
    video && !reduce && !touch
      ? {
          onMouseEnter: () => vid.current?.play().catch(() => {}),
          onMouseLeave: () => vid.current?.pause(),
        }
      : {};

  return (
    <div ref={ref} className="absolute inset-0" {...hoverProps}>
      {image && <img src={image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110" />}
      {video && !reduce && (
        <video
          ref={vid}
          src={video}
          muted
          loop
          playsInline
          preload="none"
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}
