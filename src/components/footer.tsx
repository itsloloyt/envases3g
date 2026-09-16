import Link from "next/link";
import { ArrowUpRight, Camera, MapPin, Mail, Phone } from "lucide-react";
import { Logo } from "./header";
import { categories, whatsapp } from "@/lib/catalog";
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link href="/">
            <Logo />
          </Link>
          <p>
            El envase es el comienzo.
            <br />
            Lo que viene después, lo creás vos.
          </p>
          <div className="socials">
            <a
              href="https://instagram.com/envases3gmdq"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <Camera size={19} />
            </a>
            <a
              href="https://facebook.com/envases3g"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <span style={{ fontWeight: 700, fontSize: 20 }}>f</span>
            </a>
          </div>
        </div>
        <div>
          <h3>Explorá el catálogo</h3>
          {categories.map((c) => (
            <Link key={c.slug} href={"/productos?categoria=" + c.slug}>
              {c.name}
            </Link>
          ))}
        </div>
        <div>
          <h3>Estamos cerca</h3>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Moreno+4156+Mar+del+Plata"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={15} /> Moreno 4156, Mar del Plata
          </a>
          <a href="mailto:envases3g@gmail.com">
            <Mail size={15} /> envases3g@gmail.com
          </a>
          <a href="tel:+542235984362">
            <Phone size={15} /> 0223 598 4362
          </a>
          <a
            className="footer-whatsapp"
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            Escribinos por WhatsApp <ArrowUpRight size={16} />
          </a>
        </div>
        <div>
          <h3>Tu compra</h3>
          <p>
            Efectivo en tienda
            <br />
            Otros medios de pago a acordar
          </p>
          <p>
            Retiro en nuestro local
            <br />
            Envío a acordar
          </p>
          <a
            href="https://www.envases3g.com.ar/#login-modal"
            target="_blank"
            rel="noreferrer"
          >
            Mi cuenta en la tienda
          </a>
          <Link href="/contacto?tipo=mayorista">
            Solicitar cuenta mayorista
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} Envases 3G. Todos los derechos
          reservados.
        </span>
        <div>
          <Link href="/contacto?tipo=arrepentimiento">
            Botón de arrepentimiento
          </Link>
          <Link href="/administracion/pedidos">Acceso del equipo</Link>
          <Link href="/administracion/catalogo">Editar catálogo</Link>
        </div>
      </div>
    </footer>
  );
}
