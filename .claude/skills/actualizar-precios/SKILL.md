---
name: actualizar-precios
description: Actualiza los precios de la tienda Envases 3G a partir de un Excel (.xlsx/.xls/.csv) que manda el dueño. Usar cuando el usuario pase una planilla de precios o pida "actualizá los precios con este Excel".
---

# Actualizar precios desde un Excel

El catálogo publicado vive en Supabase (proyecto `aaqncfxpdnlxmxmylkzq`, tabla `products`,
columna `data` con `variants[].price`). La página lee de ahí y los pedidos calculan el total con
esos mismos precios, así que actualizar la tabla actualiza todo.

## 1. Analizar el Excel (no cambia nada)

```bash
node scripts/precios-excel.mjs "RUTA/AL/EXCEL.xlsx"
```

- Lee todas las hojas y detecta solas las columnas: producto/nombre/descripción, código,
  variante/accesorio, precio (o slug/url si vienen).
- Acepta el formato "ancho": una fila por envase y una columna de precio por accesorio
  (ej. `Precio solo | Spray negra | Crema blanca`).
- Empareja por slug, o por nombre exigiendo la misma capacidad (un 200 cc nunca se confunde con un 250 cc).
- Deja en `reports/precios-AAAA-MM-DD/`: `resumen.md`, `cambios.json`, `sospechosos.json`
  (cambios de más del doble o menos de la mitad) y `no-encontrados.csv`.

Mostrale al usuario el resumen: cuántos cambian, los sospechosos y los no encontrados.
Los sospechosos NO se aplican sin que el usuario los confirme.

## 2. Respaldo antes de tocar precios

```sql
create table products_backup_AAAAMMDD as select * from products;
alter table products_backup_AAAAMMDD enable row level security;
```

## 3. Aplicar los cambios

Para no pegar SQL enorme, usar una tabla temporal:

1. Crear `price_stage(slug text, variant_id text, price numeric)` con RLS y una política
   temporal de INSERT para `anon`.
2. Subir `cambios.json` con un POST a `${url}/rest/v1/price_stage` (clave publicable de
   `src/data/supabase-config.json`).
3. Aplicar:
   ```sql
   update products p set data = jsonb_set(p.data, '{variants}', (
     select jsonb_agg(case when s.price is not null then jsonb_set(v, '{price}', to_jsonb(s.price)) else v end order by o)
     from jsonb_array_elements(p.data->'variants') with ordinality as t(v, o)
     left join price_stage s on s.slug = p.slug and s.variant_id = v->>'id'))
   where p.slug in (select slug from price_stage);
   update products set data = jsonb_set(data, '{price}', to_jsonb((select min((v->>'price')::numeric) from jsonb_array_elements(data->'variants') v)));
   ```
4. Borrar la política temporal y la tabla `price_stage`.
5. Revisar con `get_advisors` (security) que no quede nada abierto.

## 4. Publicar

La página guarda caché una hora. Para que se vea al instante, hacer un commit vacío en `main` y `git push`
(Vercel reconstruye). Comprobar un par de precios en https://envases3g.vercel.app.
