"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Minus,
  ArrowUpRight,
  MapPin,
  Package,
  Check,
  ShoppingBag,
} from "lucide-react";
import { Product, currency, categoryName, whatsapp } from "@/lib/catalog";
import { useShop } from "./shop-provider";
export function ProductDetail({ product: p }: { product: Product }) {
  const shop = useShop();
  const [image, setImage] = useState(0);
  const [variantId, setVariantId] = useState(
    (p.variants.find((v) => v.available) || p.variants[0])?.id || "",
  );
  const variant = p.variants.find((v) => v.id === variantId);
  const [quantity, setQuantity] = useState(variant?.minQuantity || 1);
  const price = variant?.price ?? p.price;
  const available = variant?.available ?? p.available;
  return (
    <>
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <Link href="/productos">Productos</Link>
        <span>/</span>
        <Link href={"/productos?categoria=" + p.category}>
          {categoryName(p.category)}
        </Link>
      </nav>
      <div className="detail-layout">
        <div>
          <div className="detail-image">
            <Image
              src={p.images[image]}
              alt={p.name + " — imagen " + (image + 1)}
              fill
              sizes="(max-width:760px) 94vw, 48vw"
              priority
            />
          </div>
          {p.images.length > 1 && (
            <div className="thumbnails">
              {p.images.map((src, i) => (
                <button
                  className={image === i ? "active" : ""}
                  key={src + i}
                  aria-label={"Ver imagen " + (i + 1)}
                  aria-pressed={image === i}
                  onClick={() => setImage(i)}
                >
                  <Image src={src} alt="" width={72} height={85} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{categoryName(p.category)}</span>
          <h1>{p.name}</h1>
          <div className="detail-price">
            {price != null ? currency(price) : "Consultar precio"}
            <span>Precio por unidad</span>
          </div>
          <span className={"availability " + (!available ? "unavailable" : "")}>
            {available ? <Check size={14} /> : <Package size={14} />}{" "}
            {available
              ? "Disponible en el catálogo"
              : "Consultar disponibilidad"}
          </span>
          {p.variants.length > 0 && (
            <label className="variant-label">
              Elegí la presentación
              <select
                value={variantId}
                onChange={(e) => {
                  setVariantId(e.target.value);
                  setQuantity(
                    p.variants.find((v) => v.id === e.target.value)
                      ?.minQuantity || 1,
                  );
                }}
              >
                {p.variants.map((v) => (
                  <option value={v.id} key={v.id}>
                    {v.name} · {currency(v.price)}
                    {!v.available ? " · Sin stock publicado" : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="buy-row">
            <div className="quantity">
              <button
                aria-label="Restar cantidad"
                onClick={() =>
                  setQuantity(Math.max(variant?.minQuantity || 1, quantity - 1))
                }
                disabled={quantity <= (variant?.minQuantity || 1)}
              >
                <Minus size={17} />
              </button>
              <input
                aria-label="Cantidad"
                type="number"
                min={variant?.minQuantity || 1}
                max={9999}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(
                      9999,
                      Math.max(
                        variant?.minQuantity || 1,
                        Math.floor(Number(e.target.value) || 1),
                      ),
                    ),
                  )
                }
              />
              <button
                aria-label="Sumar cantidad"
                onClick={() => setQuantity(Math.min(9999, quantity + 1))}
              >
                <Plus size={17} />
              </button>
            </div>
            <button
              disabled={!variant || !available}
              className="button primary"
              onClick={() => variant && shop.add(p, variant, quantity)}
            >
              <ShoppingBag size={17} /> Agregar a mi pedido
            </button>
          </div>
          {variant && variant.minQuantity > 1 && (
            <small>Compra mínima: {variant.minQuantity} unidades.</small>
          )}
          <a
            className="button outline full"
            href={
              whatsapp +
              "?text=" +
              encodeURIComponent(
                `Hola, quisiera consultar por ${p.name}${variant ? " — " + variant.name : ""}. Cantidad: ${quantity}.`,
              )
            }
            target="_blank"
            rel="noreferrer"
          >
            Consultar este producto <ArrowUpRight size={17} />
          </a>
          <p className="fine">
            Precios y disponibilidad relevados el 14/09/2026. El equipo confirma
            el importe final y la entrega antes de comprar.
          </p>
          <div className="detail-services">
            <span>
              <MapPin size={18} />
              <div>
                <strong>Retiro en el local</strong>
                <small>Moreno 4156, Mar del Plata</small>
              </div>
            </span>
            <span>
              <Package size={18} />
              <div>
                <strong>Envío y pago a acordar</strong>
                <small>Efectivo disponible en tienda física</small>
              </div>
            </span>
          </div>
          <details open className="product-description">
            <summary>Detalles del producto</summary>
            <p>
              {p.description ||
                "Consultá al equipo por las características y medidas de este producto."}
            </p>
            <a
              href={p.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Ver en la tienda original <ArrowUpRight size={14} />
            </a>
          </details>
        </div>
      </div>
    </>
  );
}
