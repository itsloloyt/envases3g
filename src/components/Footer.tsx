"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/catalog";
import { site, waLink } from "@/lib/site";
import { FacebookIcon, InstagramIcon, Logo, WhatsAppIcon } from "./icons";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/administracion")) return null;
  return (
    <footer className="relative overflow-hidden bg-night text-white">
      <div aria-hidden className="caustics pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <Logo className="size-14" />
              <span className="font-display text-xl font-extrabold">Envases 3G</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">{site.description}</p>
            <div className="mt-6 flex gap-2">
              {[
                { href: site.instagram, label: "Instagram", Icon: InstagramIcon },
                { href: site.facebook, label: "Facebook", Icon: FacebookIcon },
                { href: waLink(), label: "WhatsApp", Icon: WhatsAppIcon },
              ].map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="glass-dark grid size-11 place-items-center rounded-full transition-colors duration-200 hover:bg-teal hover:text-night">
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Rubros</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/productos?rubro=${c.slug}`} className="text-white/80 transition-colors hover:text-sun">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-teal">Visitanos</h3>
            <address className="mt-4 space-y-2.5 text-sm not-italic text-white/80">
              <p>
                {site.address}, {site.city}
              </p>
              <p>
                <a href={`tel:${site.phone}`} className="hover:text-sun">{site.phoneDisplay}</a>
              </p>
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-sun">{site.email}</a>
              </p>
              {site.hours.map((h) => (
                <p key={h.days} className="flex justify-between gap-4 border-b border-white/10 pb-2 last:border-0">
                  <span className="text-white/55">{h.days}</span>
                  <span>{h.time}</span>
                </p>
              ))}
            </address>
          </div>
        </div>

        <p aria-hidden className="pointer-events-none mt-16 select-none whitespace-nowrap text-center font-display text-[20vw] font-extrabold leading-[0.8] tracking-[-0.06em] text-white/[0.05] md:text-[16vw]">
          ENVASES 3G
        </p>

        <div className="mt-6 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row">
          <p>© {new Date().getFullYear()} Envases 3G · Mar del Plata, Argentina</p>
          <p className="flex gap-4">
            <Link href="/contacto?tipo=arrepentimiento" className="underline-offset-4 hover:text-white hover:underline">
              Botón de arrepentimiento
            </Link>
            <span>Precios sujetos a cambio sin previo aviso.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
