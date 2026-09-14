import { Suspense } from "react";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { whatsapp } from "@/lib/catalog";
export const metadata = { title: "Contacto" };
export default function Contact() {
  return (
    <main id="contenido" className="container contact-page">
      <div className="contact-intro">
        <span className="eyebrow">
          LAS BUENAS IDEAS EMPIEZAN CON UNA CHARLA
        </span>
        <h1>
          Estamos para
          <br />
          <em>acompañarte.</em>
        </h1>
        <p>
          ¿Buscás un envase, tenés una duda o querés empezar un nuevo proyecto?
          Hablemos.
        </p>
        <div className="contact-methods">
          <a
            href="https://www.google.com/maps/search/?api=1&query=Moreno+4156+Mar+del+Plata"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin />
            <span>
              <small>VISITANOS</small>
              <strong>Moreno 4156</strong>Mar del Plata, Buenos Aires
            </span>
            <ArrowUpRight />
          </a>
          <a href="tel:+542235984362">
            <Phone />
            <span>
              <small>LLAMANOS</small>
              <strong>0223 598 4362</strong>
            </span>
            <ArrowUpRight />
          </a>
          <a href="mailto:envases3g@gmail.com">
            <Mail />
            <span>
              <small>ESCRIBINOS</small>
              <strong>envases3g@gmail.com</strong>
            </span>
            <ArrowUpRight />
          </a>
        </div>
        <a
          className="button outline"
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
        >
          Abrir WhatsApp <ArrowUpRight size={18} />
        </a>
        <div className="visit-note">
          <strong>Tu compra, a tu manera.</strong>
          <p>
            Retirá en nuestro local o coordiná el envío. Podés pagar en efectivo
            en tienda o acordar otro medio con el equipo.
          </p>
        </div>
      </div>
      <Suspense fallback={<p>Cargando formulario…</p>}>
        <ContactForm />
      </Suspense>
    </main>
  );
}
