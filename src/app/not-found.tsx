import Link from "next/link";
export default function NotFound() {
  return (
    <main id="contenido" className="container empty">
      <span className="eyebrow">404</span>
      <h1>Este envase no está por acá.</h1>
      <p>Volvé al catálogo para encontrar lo que buscás.</p>
      <Link className="button primary" href="/productos">
        Explorar productos
      </Link>
    </main>
  );
}
