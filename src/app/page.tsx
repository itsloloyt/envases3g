import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowUpRight,
  ArrowRight,
  Package,
  MapPin,
  MessagesSquare,
  Sparkles,
  Plus,
} from "lucide-react";
import { categories } from "@/lib/catalog";
import { getCatalog } from "@/lib/catalog-server";
import { ProductCard } from "@/components/product-card";
import { EditorialShowcase } from "@/components/editorial-showcase";
import photography from "@/data/product-photography.json";
export default async function Home() {
  await connection();
  const products = await getCatalog();
  const featured = [
    "body-125-cc-ambar",
    "frasco-vidrio-amanecer-250-cc",
    "frasco-apollo-vidrio-125-ml-ambar-con-tapa-difusora",
    "frasco-vidrio-yogurt-200cc",
  ]
    .map((slug) => products.find((p) => p.slug === slug)!)
    .filter(Boolean);
  return (
    <main id="contenido">
      <section className="premium-hero" aria-labelledby="hero-title">
        <Image
          className="premium-hero-art premium-hero-art-desktop"
          src="/images/hero-3g-medallion-desktop.png"
          alt=""
          fill
          priority
          sizes="(max-width: 760px) 1px, 100vw"
        />
        <Image
          className="premium-hero-art premium-hero-art-mobile"
          src="/images/hero-3g-medallion-mobile.png"
          alt=""
          fill
          priority
          sizes="(max-width: 760px) 100vw, 1px"
        />
        <div className="premium-hero-content container">
          <div className="premium-hero-copy">
            <span className="premium-hero-kicker">&#123; SOMOS ENVASES 3G &#125; <ArrowRight size={15} /></span>
            <h1 id="hero-title">Cada idea<br />merece un<br /><span>gran envase.</span></h1>
            <p>Envases de plástico y vidrio, tapas, válvulas y accesorios para perfumería, cosmética, farmacia, alimentos y aromas. Para proyectos de todos los tamaños.</p>
            <div className="premium-hero-actions">
              <Link href="/productos" className="premium-hero-button">VER PRODUCTOS <ArrowUpRight size={18} /></Link>
              <Link href="/contacto" className="premium-hero-button secondary">CONTACTANOS <ArrowUpRight size={18} /></Link>
            </div>
          </div>
          <div className="premium-hero-bottom" aria-hidden="true">
            <span>DESCUBRÍ MÁS <span className="premium-scroll-arrow">↓</span></span>
            <span>MAR DEL PLATA, ARGENTINA</span>
          </div>
        </div>
      </section>
      <div className="benefits">
        <div className="container benefits-inner">
          <div>
            <Package />
            <span>
              <strong>Un mundo de envases</strong>
              <small>425 productos para descubrir</small>
            </span>
          </div>
          <div>
            <MapPin />
            <span>
              <strong>Encontranos en Mar del Plata</strong>
              <small>Moreno 4156 · Retiro en el local</small>
            </span>
          </div>
          <div>
            <MessagesSquare />
            <span>
              <strong>Te ayudamos a elegir</strong>
              <small>Atención y asesoramiento personal</small>
            </span>
          </div>
        </div>
      </div>
      <EditorialShowcase products={products.map((p) => ({ slug: p.slug, name: p.name, category: p.category, image: p.image, price: p.price }))} />
      <section className="section container" id="categorias">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CADA PROYECTO TIENE SU ENVASE</span>
            <h2>
              Un universo de posibilidades<span>.</span>
            </h2>
          </div>
          <Link href="/productos" className="text-link">
            Ver todo el catálogo <ArrowUpRight size={19} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => {
            const p = products.find((p) => p.category === c.slug)!;
            return (
              <Link
                key={c.slug}
                href={"/productos?categoria=" + c.slug}
                className={"category-card category-" + i}
              >
                <div className="category-photo">
                  <Image
                    src={c.image.startsWith("http") || c.image.startsWith("/") ? c.image : ((photography as Record<string,string>)[p.slug] || p.image)}
                    alt={c.name}
                    fill
                    sizes="(max-width:600px) 46vw, 23vw"
                  />
                </div>
                <div className="category-label">
                  <span>
                    <h3>{c.short}</h3>
                    <small>{c.text}</small>
                  </span>
                  <ArrowUpRight size={21} />
                </div>
                <span className="category-count">
                  {products.filter((p) => p.category === c.slug).length}{" "}
                  productos
                </span>
              </Link>
            );
          })}
        </div>
        <div className="catalog-total"><strong>425 productos</strong><span>Vidrio, plástico, accesorios, aromas, cosmética, alimentos y kits, con sus variantes, precios y disponibilidad del catálogo original.</span><Link href="/productos" className="text-link">Ver el catálogo completo <ArrowUpRight size={18}/></Link></div>
      </section>
      <section className="section container discounts-section" id="descuentos">
        <div className="discounts-copy"><span className="eyebrow">MÁS ENVASES, MÁS POSIBILIDADES</span><h2>Descuentos vigentes<span>.</span></h2><p>Combiná diferentes productos y aprovechá los descuentos por cantidad.</p><p>En efectivo: 10% por más de 20 productos, 15% por más de 50 y 20% por más de 200. Por transferencia: 10% por más de 100 y 15% por más de 200.</p><p className="fine">No incluye líquidos, aceites, combos, promos, varillas ni línea Marena. El equipo confirma qué productos participan antes del pago.</p><Link href="/productos" className="button primary">Armá tu pedido <ArrowUpRight size={20}/></Link></div>
        <a href="https://d22fxaf9t8d39k.cloudfront.net/a5b3f5164d93d0514b3fe551b3d849810eaa165376bb841b19e6362858363a6c99432.jpg" target="_blank" rel="noreferrer" aria-label="Ampliar imagen de descuentos vigentes"><Image src="https://d22fxaf9t8d39k.cloudfront.net/a5b3f5164d93d0514b3fe551b3d849810eaa165376bb841b19e6362858363a6c99432.jpg" alt="Descuentos por cantidad en efectivo y transferencia. Condiciones detalladas junto a la imagen." width={1024} height={669} sizes="(max-width: 900px) 100vw, 60vw"/></a>
      </section>
      <section className="featured-section">
        <div className="section container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">IDEAS PARA EMPEZAR</span>
              <h2>
                Pequeños grandes elegidos<span>.</span>
              </h2>
            </div>
            <Link href="/productos" className="text-link">
              Explorar productos <ArrowUpRight size={19} />
            </Link>
          </div>
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="story" id="nosotros">
          <div className="story-art">
            <span className="eyebrow">ENVASES 3G · MAR DEL PLATA</span>
            <span className="story-large">
              El comienzo
              <br />
              de <em>algo tuyo.</em>
            </span>
            <div className="story-line-art">
              <Package size={100} strokeWidth={0.7} />
              <Sparkles size={46} strokeWidth={0.7} />
            </div>
            <span>Un envase. Todas tus posibilidades.</span>
          </div>
          <div className="story-copy">
            <span className="eyebrow">DE TU IDEA A LAS MANOS DE ALGUIEN</span>
            <h2>
              Cada envase guarda
              <br />
              una nueva historia.
            </h2>
            <p>
              Una fragancia que transforma un espacio. Una crema creada con
              dedicación. Una conserva con tu receta favorita.
            </p>
            <p>
              En Envases 3G encontrás envases de vidrio y plástico, accesorios,
              válvulas, gatillos, varillas, esencias y difusores para dar forma
              a lo que tenés en mente.
            </p>
            <Link href="/contacto" className="text-link">
              Conocenos en Moreno 4156 <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="section container help-section" id="como-comprar">
        <div className="section-heading"><div><span className="eyebrow">SIMPLE Y ACOMPAÑADO</span><h2>Comprar también puede ser fácil<span>.</span></h2></div><Link href="/contacto" className="text-link">Hablar con el equipo <ArrowUpRight size={18}/></Link></div>
        <div className="buy-steps"><article><span>01</span><h3>Explorá</h3><p>Buscá por material, capacidad o categoría. En cada ficha vas a encontrar todas las tapas, válvulas y presentaciones disponibles.</p></article><article><span>02</span><h3>Armá tu pedido</h3><p>Elegí la variante y la cantidad mínima. El total se calcula automáticamente con el precio vigente.</p></article><article><span>03</span><h3>Coordinamos</h3><p>Registramos tu orden, te damos un número y abrimos WhatsApp para confirmar stock, descuentos, pago y entrega.</p></article></div>
        <div className="faq-grid"><details><summary>¿Los precios son finales?</summary><p>Son los precios publicados por Envases 3G para cada variante. Antes de pagar confirmamos stock, descuentos aplicables y costo de entrega.</p></details><details><summary>¿Puedo comprar por cantidad?</summary><p>Sí. La imagen de descuentos vigentes explica las condiciones de efectivo y transferencia. Algunos productos están excluidos.</p></details><details><summary>¿Dónde retiro o consulto?</summary><p>Estamos en Moreno 4156, Mar del Plata. También podés escribirnos al 0223 598 4362 o por WhatsApp.</p></details></div>
      </section>
      <section className="contact-banner">
        <div className="container">
          <div>
            <span className="eyebrow">ESTAMOS PARA ACOMPAÑARTE</span>
            <h2>¿Le damos forma a tu próxima idea?</h2>
            <p>Contanos qué estás buscando. Te ayudamos a encontrarlo.</p>
          </div>
          <Link href="/contacto" className="button cream">
            Hablemos de tu proyecto <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
    </main>
  );
}
