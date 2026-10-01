import { BadgePercent, Store, Truck } from "lucide-react";
import { DISCOUNT_HEADLINE } from "@/lib/discounts";
import { site } from "@/lib/site";

/** Barra superior animada con descuentos vigentes y datos clave (como la tienda original, renovada). */
export function AnnouncementBar() {
  const items = [
    { Icon: BadgePercent, text: `Pagando en efectivo: ${DISCOUNT_HEADLINE}` },
    { Icon: Truck, text: "Envíos a todo el país por Correo Argentino" },
    { Icon: Store, text: `Retiro sin cargo en ${site.address}, Mar del Plata` },
    { Icon: BadgePercent, text: "Vidrio · Plástico · Válvulas · Gatillos · Varillas · Esencias · Difusores" },
  ];
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden bg-sun text-night" role="region" aria-label="Novedades y descuentos">
      <div className="marquee flex w-max gap-10 whitespace-nowrap py-1.5 text-[12px] font-semibold" style={{ animationDuration: "38s" }}>
        {row.map(({ Icon, text }, i) => (
          <span key={i} className="flex items-center gap-2" aria-hidden={i >= items.length}>
            <Icon className="size-3.5" /> {text}
            <span className="ml-8 size-1 rounded-full bg-night/40" />
          </span>
        ))}
      </div>
    </div>
  );
}
