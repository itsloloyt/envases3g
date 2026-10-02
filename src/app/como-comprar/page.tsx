import type { Metadata } from "next";
import { HowToBuy } from "@/components/home/Sections";
import { Discounts } from "@/components/home/Discounts";

export const metadata: Metadata = {
  title: "Cómo comprar",
  description: "Elegí tus productos, confirmá por WhatsApp y retirá o recibí tu pedido. Descuentos pagando en efectivo.",
};

export default function ComoComprar() {
  return (
    <div className="pt-16">
      <HowToBuy />
      <Discounts />
    </div>
  );
}
