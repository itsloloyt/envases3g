"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  Package,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { useShop } from "./shop-provider";
export function Logo() {
  return (
    <span className="logo">
      <span className="logo-mark">
        <Image src="https://d22fxaf9t8d39k.cloudfront.net/341755497af03ec86a78e6191618f1a413fd32e31b76ede124f1dc682ceba73e99432.jpeg" alt="" width={62} height={62} priority />
      </span>
      <span>
        ENVASES
        <span className="logo-3g">
          3G<span className="logo-dot">.</span>
        </span>
      </span>
    </span>
  );
}
export function Header() {
  const shop = useShop();
  const [menu, setMenu] = useState(false);
  return (
    <>
      <div className="topbar">
        <span>Envases para cada idea. Posibilidades para cada proyecto.</span>
        <span>
          <MapPin size={12} /> Mar del Plata, Buenos Aires
        </span>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Link href="/" aria-label="Envases 3G — Inicio">
            <Logo />
          </Link>
          <nav
            className={menu ? "main-nav expanded" : "main-nav"}
            aria-label="Navegación principal"
          >
            <Link href="/productos" onClick={() => setMenu(false)}>
              Productos
            </Link>
            <Link
              href="/productos?categoria=combos-y-kits"
              onClick={() => setMenu(false)}
            >
              Combos y kits
            </Link>
            <Link href="/#nosotros" onClick={() => setMenu(false)}>
              Nosotros
            </Link>
            <Link href="/contacto" onClick={() => setMenu(false)}>
              Contacto
            </Link>
          </nav>
          <div className="header-actions">
            <Link
              href="/productos#busqueda"
              className="icon-button"
              aria-label="Buscar productos"
            >
              <Search size={20} />
            </Link>
            <button
              className="icon-button bag"
              aria-label="Abrir mi pedido"
              onClick={shop.open}
            >
              <ShoppingBag size={20} />
              <span>{shop.lines.reduce((s, l) => s + l.quantity, 0)}</span>
            </button>
            <Link className="header-contact" href="/contacto">
              Hablemos <ArrowUpRight size={16} />
            </Link>
            <button
              className="icon-button menu-toggle"
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
