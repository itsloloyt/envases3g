---
name: fotos-con-ia
description: Toma una carpeta de fotos de envases del dueño de Envases 3G y crea con Higgsfield la versión editorial (fondo arena, luz natural) de cada una, guardándolas en una subcarpeta IA dentro de la misma carpeta. Usar cuando el usuario pase una carpeta de fotos o pida "hacé las fotos con IA de esta carpeta".
---

# Fotos con IA desde una carpeta

Regla de oro: **no inventar nada**. El envase, la tapa, la válvula o el accesorio tienen que quedar
idénticos a la foto original (forma, color, terminación, proporciones). Solo cambia el fondo y la luz.

## 1. Preparar

```bash
node scripts/fotos-carpeta.mjs preparar "RUTA/CARPETA"
```

Crea `RUTA/CARPETA/IA/_referencias/` (copias livianas) y `RUTA/CARPETA/IA/lista.json`
(con el producto del catálogo que coincide con el nombre de cada archivo, si lo hay).
Las fotos originales no se tocan.

## 2. Generar con Higgsfield (de a 4 en paralelo, es el límite de la cuenta)

1. Subir las referencias: `media_upload` con `files` (hasta 20 por llamada), hacer el PUT de cada
   archivo con curl (`-H "Content-Type: image/jpeg" -H "If-None-Match: *"`) y `media_confirm`.
2. Generar, una imagen por foto:
   - modelo `gpt_image_2_5`, `quality: low`, `resolution: 1k`, `aspect_ratio: 3:4`
   - `medias`: la referencia subida (y, si hay que poner un accesorio, la foto real del accesorio como segunda referencia)
   - prompt base:
     > Re-photograph this exact product for a minimalist editorial cover: keep the product
     > IDENTICAL (same shape, color, material, cap, label-free, proportions). Place it alone,
     > centered, on a seamless warm off-white / soft sand paper backdrop, soft natural window
     > daylight from the left casting one gentle shadow, subtle paper texture, slight film grain.
     > Real photo, no CGI look, no props, no text.
3. Esperar con `jobs_wait` y, por cada resultado:
   ```bash
   node scripts/fotos-carpeta.mjs guardar "RUTA/CARPETA" "nombre-original.jpg" "URL_RESULTADO"
   ```
   Queda en `RUTA/CARPETA/IA/nombre-original.png` y `.webp` (encuadrado según capacidad).

## 3. Revisar

Armar una hoja de control (original al lado del resultado) y comparar a ojo **cada** foto.
Si algo no coincide con el original, rehacer esa sola. Nunca publicar una foto dudosa.

## 4. Publicar en la página (opcional)

Si el usuario quiere usarlas como portadas:

```bash
node scripts/fotos-carpeta.mjs publicar "RUTA/CARPETA"
```

Después build, commit y push a `main` (ver flujo de publicación del proyecto).
