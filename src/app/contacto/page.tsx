import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { SplitHeading, Reveal } from "@/components/Reveal";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: `Consultas, cotizaciones mayoristas y pedidos. ${site.address}, ${site.city}.`,
};

export default async function ContactoPage({ searchParams }: PageProps<"/contacto">) {
  const sp = await searchParams;
  const tipo = typeof sp.tipo === "string" ? sp.tipo : "consulta";
  const channels = [
    { Icon: WhatsAppIcon, label: "WhatsApp", value: site.phoneDisplay, href: waLink() },
    { Icon: Phone, label: "Teléfono", value: site.phoneDisplay, href: `tel:${site.phone}` },
    { Icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { Icon: InstagramIcon, label: "Instagram", value: site.instagramHandle, href: site.instagram },
  ];

  return (
    <div className="relative overflow-hidden pb-24 pt-32">
      <div aria-hidden className="pointer-events-none absolute -left-40 top-20 -z-10 size-[520px] rounded-full bg-teal/25 blur-[120px]" />
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-deep">Contacto</p>
          <SplitHeading as="h1" text="Hablemos de tu próximo envase" className="mt-3 font-display text-5xl font-extrabold leading-[1] sm:text-6xl" />
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-ink-2">
              ¿Necesitás una cotización mayorista, saber si hay stock o encontrar la tapa compatible? Escribinos y te respondemos a la brevedad.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {channels.map(({ Icon, label, value, href }, i) => (
              <Reveal key={label} delay={0.1 + i * 0.06}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex h-full items-center gap-4 rounded-2xl border border-line bg-white/60 p-4 transition-colors duration-200 hover:border-ink"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-paper-2 transition-colors group-hover:bg-ink group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-muted">{label}</span>
                    <span className="block truncate text-sm font-medium">{value}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3} className="mt-6 rounded-2xl bg-paper-2 p-5 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <MapPin className="size-4 text-teal-deep" /> {site.address}, {site.city}
            </p>
            <div className="mt-3 flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-teal-deep" />
              <div className="flex-1">
                {site.hours.map((h) => (
                  <p key={h.days} className="flex justify-between gap-4">
                    <span className="text-muted">{h.days}</span>
                    <span>{h.time}</span>
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.15} className="lg:col-span-7">
          <ContactForm initialType={tipo} />
        </Reveal>
      </div>
    </div>
  );
}
