import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[80dvh] place-items-center px-4 pt-24 text-center">
      <div>
        <p className="font-display text-[9rem] font-extrabold leading-none text-teal/25">404</p>
        <h1 className="-mt-6 font-display text-4xl font-extrabold">Este envase quedó vacío</h1>
        <p className="mt-3 text-muted">La página que buscás no existe o el producto ya no está disponible.</p>
        <div className="mt-8 flex justify-center gap-2">
          <Link href="/productos" className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-teal-deep">
            Ver catálogo
          </Link>
          <Link href="/" className="rounded-full border border-ink/15 px-6 py-3 text-sm font-medium hover:border-ink">
            Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
