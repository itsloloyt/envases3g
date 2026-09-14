# Envases 3G

Rediseño con Next.js App Router, React, TypeScript y Supabase; preparado para Vercel y GitHub.

## Ejecutar

Node.js 22 o superior y pnpm 11.19.0. Ejecutar `pnpm install --frozen-lockfile`. `pnpm dev` inicia el sitio; `pnpm build` verifica y genera producción. Ambos comandos preparan las fuentes, la foto de portada y el catálogo desde sus fuentes públicas. Las variables de `.env.example` permiten reemplazar la configuración del proyecto.

## Catálogo

425 productos importados del sitemap público de https://www.envases3g.com.ar/ el 14/09/2026. Incluye los siete rubros, subcategorías, descripciones, todas las imágenes disponibles, presentaciones, precios, cantidades mínimas y disponibilidad publicada. Los precios son una captura del catálogo, no una sincronización de inventario en tiempo real.

`scripts/prepare-catalog.mjs` genera `src/data/products.json` desde Supabase antes de compilar. Esa copia generada se incluye en el sitio para mantenerlo disponible si la base deja de responder, y se excluye de Git. El script valida los 425 productos antes de sobrescribirla. Un checkout nuevo necesita acceso a Supabase durante el primer build. `GET /api/catalogo` consulta Supabase con respaldo en esa copia. La web es un catálogo con pedido consultable por WhatsApp; no procesa cobros. Las cuentas de clientes siguen enlazadas a la tienda original, porque no se migraron sus credenciales.

## Supabase

Proyecto configurado: `aaqncfxpdnlxmxmylkzq`, región São Paulo. El esquema de `supabase/schema.sql` ya está aplicado y contiene 425 productos y 3.188 variantes. `src/data/supabase-config.json` contiene únicamente la URL y la clave pública publishable: no son credenciales administrativas. Las variables `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` permiten usar otro proyecto. No volver a aplicar el esquema en la base existente.

El formulario guarda las consultas en `inquiries`; si no puede guardarlas ofrece enviar el mensaje por WhatsApp o email. Las consultas se revisan en https://supabase.com/dashboard/project/aaqncfxpdnlxmxmylkzq/editor: no se envían notificaciones por email automáticamente.

RLS habilitado en ambas tablas. El catálogo tiene lectura pública. Las consultas permiten solamente insertar los campos esperados; no tienen lectura, actualización o eliminación pública. No se usa ni expone una clave service role.

## Vercel y GitHub

Framework: Next.js. Instalación: `pnpm install --frozen-lockfile`. Build: `pnpm build`. Configurar las variables de `.env.example` en Vercel y conectar el repositorio de GitHub para desplegar automáticamente cambios en `main`. El workflow de GitHub verifica el build.

Repositorio elegido: https://github.com/itsloloyt/envases3g. Proyecto de Vercel creado: `envases3g`, alias informado https://envases3g-itsloloyt.vercel.app. La conexión automática entre GitHub y Vercel requiere acceso de escritura al repositorio y acceso al proyecto en ambas cuentas.

Los archivos binarios se preparan con `scripts/prepare-assets.mjs` durante el build. Las fuentes quedan servidas localmente por `next/font` y la imagen de portada por `next/image`, sin solicitudes a Google Fonts desde el navegador.

## Fuentes de imágenes

Las fotos de las fichas pertenecen al catálogo original y se cargan desde su CDN, indicado en cada registro. La imagen de ambientación de portada fue obtenida de https://www.faire.com/discover/unbranded (https://cdn.faire.com/fastly/b82abce062ea60e11df4bedfadfcf8bb2b6ae2b8134d25504395dcbb2588b76d.jpeg); está identificada como inspiración y no reemplaza las fotos reales del catálogo. Tipografías DM Sans y Manrope, Google Fonts.

## Actualizar la copia del catálogo

El script `scripts/crawl.py` releva las URLs del sitemap almacenado en `research/sitemap.xml` y guarda las fichas en `src/data/products.json`. Requiere Python 3, sin dependencias adicionales. `research/` se excluye del repositorio. Para una actualización se debe descargar un sitemap nuevo, usar una carpeta de caché vacía, ejecutar el script y revisar su reporte antes de publicar los datos nuevos.
