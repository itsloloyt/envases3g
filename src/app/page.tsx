import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Package,
  MapPin,
  MessagesSquare,
  Sparkles,
  Plus,
} from "lucide-react";
import { products, categories } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
export default function Home() {
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
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="tiny-dot" /> GRANDES IDEAS EMPIEZAN CON UN ENVASE
          </span>
          <h1>
            Vos lo imaginás.
            <br />
            Nosotros lo
            <br />
            <em>contenemos.</em>
          </h1>
          <p>
            Frascos, botellas, aromas y esos pequeños detalles que hacen grande
            tu proyecto.
          </p>
          <div className="hero-buttons">
            <Link href="/productos" className="button primary">
              Encontrá tu envase <ArrowUpRight size={19} />
            </Link>
            <Link
              href="/productos?categoria=combos-y-kits"
              className="text-link"
            >
              Descubrí los kits <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-caption">
            <span className="small-line" /> VIDRIO · PLÁSTICO · INFINITAS
            POSIBILIDADES
          </div>
        </div>
        <div className="hero-visual">
          <Image
            src="/images/hero-envases.jpg"
            alt="Envases ámbar con dosificador, spray y gotero sobre una tela natural"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 52vw"
          />
          <div className="hero-image-shade" />
          <span className="hero-image-label">
            Pequeños envases.
            <br />
            <strong>Grandes comienzos.</strong>
          </span>
          <div className="round-seal">
            <Sparkles size={22} />
            <span>
              DALE FORMA
              <br />A TU IDEA
            </span>
          </div>
          <span className="image-note">Inspiración en envases</span>
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
          {categories.slice(0, 4).map((c, i) => {
            const p =
              products.find((p) => p.slug === c.image) ||
              products.find((p) => p.category === c.slug)!;
            return (
              <Link
                key={c.slug}
                href={"/productos?categoria=" + c.slug}
                className={"category-card category-" + i}
              >
                <div className="category-photo">
                  <Image
                    src={p.image}
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
        <div className="more-categories">
          <span>Y mucho más para crear:</span>
          {categories.slice(4).map((c) => (
            <Link key={c.slug} href={"/productos?categoria=" + c.slug}>
              {c.name}
              <Plus size={15} />
            </Link>
          ))}
        </div>
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
