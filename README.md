# Envases 3G

Rediseño con Next.js App Router, React, TypeScript y Supabase; preparado para Vercel y GitHub.

## Ejecutar

Node.js 22 o superior y pnpm. Ejecutar `pnpm install --frozen-lockfile`, copiar `.env.example` a `.env.local` y completar las variables. `pnpm dev` inicia el sitio; `pnpm build` verifica y genera producción.

## Catálogo

425 productos importados del sitemap público de https://www.envases3g.com.ar/ el 14/09/2026. Incluye los siete rubros, subcategorías, descripciones, todas las imágenes disponibles, presentaciones, precios, cantidades mínimas y disponibilidad publicada. Los precios son una captura del catálogo, no una sincronización de inventario en tiempo real.

`src/data/products.json` mantiene la copia de respaldo. `GET /api/catalogo` consulta Supabase y utiliza el respaldo si la base no responde. La web es un catálogo con pedido consultable por WhatsApp; no procesa cobros. Las cuentas de clientes siguen enlazadas a la tienda original, porque no se migraron sus credenciales.

## Supabase

Aplicar `supabase/schema.sql` una vez en un proyecto nuevo e importar el catálogo en `products`. `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` se configuran en el servidor. El formulario guarda las consultas en `inquiries`; si no puede guardarlas ofrece enviar el mensaje por WhatsApp o email. Las consultas se consultan en el dashboard de Supabase: no se envían notificaciones por email automáticamente.

RLS habilitado en ambas tablas. El catálogo tiene lectura pública. Las consultas permiten solamente insertar los campos esperados; no tienen lectura, actualización o eliminación pública. No se usa ni expone una clave service role.

## Vercel y GitHub

Framework: Next.js. Instalación: `pnpm install --frozen-lockfile`. Build: `pnpm build`. Configurar las variables de `.env.example` en Vercel y conectar el repositorio de GitHub para desplegar automáticamente cambios en `main`. El workflow de GitHub verifica el build.

## Fuentes de imágenes

Las fotos de las fichas pertenecen al catálogo original y se cargan desde su CDN, indicado en cada registro. La imagen de ambientación de portada fue obtenida de https://www.faire.com/discover/unbranded (https://cdn.faire.com/fastly/b82abce062ea60e11df4bedfadfcf8bb2b6ae2b8134d25504395dcbb2588b76d.jpeg); está identificada como inspiración y no reemplaza las fotos reales del catálogo. Tipografías DM Sans y Manrope, Google Fonts.

## Actualizar la copia del catálogo

El script `scripts/crawl.py` releva las URLs del sitemap almacenado en `research/sitemap.xml` y guarda las fichas en `src/data/products.json`. Requiere Python 3, sin dependencias adicionales. `research/` se excluye del repositorio. Para una actualización se debe descargar un sitemap nuevo, usar una carpeta de caché vacía, ejecutar el script y revisar su reporte antes de publicar los datos nuevos.
