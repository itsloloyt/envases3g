"use client";
import { usePathname } from "next/navigation";
import { waLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

export function WhatsAppFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/administracion")) return null;
  return (
    <a
      href={waLink("Hola Envases 3G! Quería hacer una consulta.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-40 hidden size-14 lg:grid place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_30px_-8px_rgb(37_211_102/0.6)] transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 motion-reduce:hidden" />
      <WhatsAppIcon className="relative size-7" />
    </a>
  );
}
