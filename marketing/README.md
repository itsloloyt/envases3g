# Agencia de marketing automatizada — Envases 3G

## Qué hay
- `.agents/product-marketing.md` — contexto de marca: público, voz (voseo), diferenciales y **pilares por día**.
- `.claude/skills/` — skills de [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) (MIT): social, content-strategy, copywriting, marketing-plan, ad-creative, offers… Abrí Claude Code en este repo y pedí, por ej.: *"armá el plan de contenidos de noviembre"*, *"5 ideas de reels para difusores"*, *"copy para un anuncio mayorista"*.
- `scripts/social-post.mjs` — cada día elige un producto real del catálogo (Supabase) según el pilar, escribe el post con Claude siguiendo la skill `social` y lo publica en **Facebook e Instagram** con la foto del producto.
- `.github/workflows/social-daily.yml` — lo ejecuta todos los días a las 10:47 (Argentina) y guarda cada post en `marketing/posts/AAAA-MM-DD.json`.

## Pilares
Lun producto destacado · Mar tip para emprender · Mié combinaciones · Jue mayorista · Vie inspiración · Sáb esencias y aromas · Dom marca y local.

## Puesta en marcha (una sola vez)
1. Instagram **@envases3gmdq** tiene que ser cuenta **Profesional** (empresa o creador) y estar **vinculada a la página de Facebook**.
2. En https://developers.facebook.com creá una app tipo *Empresa* y agregá los productos *Instagram* y *Facebook Login for Business*.
3. En el *Explorador de la API Graph* generá un token de usuario con permisos: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`, `business_management`.
4. Cambialo por un token de larga duración y pedí `GET /me/accounts`: el `access_token` de la página **no vence** → ese es `META_PAGE_TOKEN`; el `id` es `META_PAGE_ID`.
5. `GET /{META_PAGE_ID}?fields=instagram_business_account` → ese id es `META_IG_USER_ID`.
6. Creá una clave en https://console.anthropic.com → `ANTHROPIC_API_KEY` (sin ella usa una plantilla fija).
7. En GitHub → *Settings → Secrets and variables → Actions* cargá los 4 secretos.
8. *Actions → Publicar en redes (diario) → Run workflow* con "Solo probar" tildado para ver el post sin publicarlo; después corrélo destildado para el primer post real.

Probar localmente: `node scripts/social-post.mjs --dry-run`.
