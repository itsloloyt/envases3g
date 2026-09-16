import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ShopProvider } from "@/components/shop-provider";
import { WhatsappButton } from "@/components/whatsapp-button";
import "./globals.css";
const dm = localFont({
  src: "../../public/fonts/dm-sans.woff2",
  variable: "--font-dm",
  display: "swap",
  weight: "400 700",
});
const manrope = localFont({
  src: "../../public/fonts/manrope.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "400 800",
});
export const metadata: Metadata = {
  title: {
    default: "Envases 3G · El comienzo de tus ideas",
    template: "%s | Envases 3G",
  },
  description:
    "Envases de vidrio y plástico, accesorios, esencias y difusores. Descubrí el catálogo de Envases 3G en Moreno 4156, Mar del Plata.",
  openGraph: { locale: "es_AR", type: "website", siteName: "Envases 3G" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" data-scroll-behavior="smooth" className={`${dm.variable} ${manrope.variable}`}>
      <body>
        <ShopProvider>
          <a className="skip-link" href="#contenido">
            Ir al contenido
          </a>
          <Header />
          {children}
          <Footer />
          <WhatsappButton />
        </ShopProvider>
      </body>
    </html>
  );
}
