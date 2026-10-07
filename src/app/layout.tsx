import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { ScrollProgress } from "@/components/ScrollProgress";
import { MobileNav } from "@/components/MobileNav";
import { FlyToCart } from "@/components/FlyToCart";
import { Mascot } from "@/components/Mascot";
import { site } from "@/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["500", "700", "800"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://envases3g.vercel.app"),
  title: { default: "Envases 3G · Envases de vidrio y plástico en Mar del Plata", template: "%s | Envases 3G" },
  description: site.description,
  openGraph: { title: "Envases 3G", description: site.description, locale: "es_AR", type: "website", siteName: "Envases 3G", images: ["/brand/logo-3g.png"] },
};

export const viewport: Viewport = { themeColor: "#041619" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${manrope.variable} ${instrument.variable}`}>
      <body className="grain min-h-dvh pb-24 lg:pb-0">
        <SmoothScroll />
        <ScrollProgress />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido">{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppFab />
        <MobileNav />
        <FlyToCart />
        <Mascot />
      </body>
    </html>
  );
}
