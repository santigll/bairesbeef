# Baires Beef

Tienda online de carnes con sección minorista (catálogo + carrito) y
mayorista (landing + consulta), pedidos que se cierran por WhatsApp, y un
panel de administración para cambiar precios y fotos de cada corte.

## Cómo está organizado

- **`/`** — Home con hero, destacados, categorías y accesos a minorista/mayorista.
- **`/tienda`** ("Productos" en el menú) — Banner de ofertas/comunicaciones
  arriba de todo, destacados de la semana, y el catálogo completo con filtro
  de categorías a la izquierda y el carrito fijo al costado (siempre visible
  mientras navegás, con lo que llevás y el total). Click en una foto o
  "Ver detalles" abre el producto en grande. Botón **"Finalizar por
  WhatsApp"** arma el mensaje con el detalle del pedido (incluida la
  presentación elegida en cada corte) y el total.
- **`/mayorista`** — Landing mayorista con beneficios y un formulario corto
  (negocio, rubro, detalle) que arma un mensaje y abre WhatsApp directo.
- **`/nosotros`**, **`/contacto`** — Institucional y datos de contacto.
- **`/admin`** — Panel protegido con usuario/contraseña para gestionar:
  - **Productos**: alta/edición/baja, precio, unidad (kg o unidad), foto,
    activo/inactivo, destacado en el home, y variante de presentación
    (ver abajo). Cada producto tiene un **código** único (SKU); desde la
    misma página se puede **exportar el catálogo a CSV** y volver a
    **importarlo** (por ejemplo después de editar precios en Excel o Google
    Sheets) — el código es la clave: si ya existe se actualiza ese
    producto, si no existe se crea uno nuevo, y las categorías que no
    existan todavía se crean solas. Sirve tanto para la carga inicial
    masiva como para actualizaciones de precios en bloque. Fotos y
    variantes quedan fuera del CSV, esas se cargan a mano por producto.
  - **Categorías**: alta/edición/orden/baja.
  - **Variantes**: formas de presentación reutilizables (picado, bifes,
    tiras, marcado, corte especial, composición, etc.), cada una con sus
    propias opciones. Un producto puede tener asignada una variante y elegir
    cuáles de sus opciones aplican (no todos los cortes admiten las mismas
    opciones), con una nota opcional por opción — por ejemplo, el peso
    aproximado de cada tira de asado.
  - **Banners**: el carrusel de ofertas/novedades que aparece arriba de todo
    en Productos.
  - **Configuración**: nombre, logo, números de WhatsApp (minorista y
    mayorista), textos de la sección mayorista, dirección, horarios, email,
    Instagram.

Los datos de productos, categorías y configuración se guardan en archivos
JSON dentro de `data/` (sin base de datos externa). Las fotos que se suben
desde el panel se guardan en `data/uploads/` y se sirven por una ruta propia
(`/uploads/<archivo>`) — así, con un único disco persistente montado en
`/app/data` alcanza para que no se pierda nada (precios, categorías y fotos).

`data/` es contenido generado en tiempo de ejecución, no se versiona. La
primera vez que arranca (o si `data/` está vacío, por ejemplo un volume
recién montado) se auto-completa copiando los datos de ejemplo desde
`data-seed/` — esa carpeta sí va en el repo y es la que podés editar si
querés cambiar los cortes de ejemplo antes de tu primer deploy.

## Antes de poner esto en producción

1. **Cargá tu WhatsApp real.** Por defecto están en `5491100000000`
   (placeholder). Cambialos desde `/admin/configuracion` apenas tengas
   acceso, o editando `data-seed/settings.json` antes del primer deploy.
2. **Cambiá el usuario y contraseña del admin.** Están definidos por
   variables de entorno:

   ```bash
   cp .env.example .env
   ```

   y completá `ADMIN_USER`, `ADMIN_PASSWORD` y `SESSION_SECRET` (un valor
   largo y aleatorio) en `.env`. Si no se configuran, el sistema usa valores
   por defecto (`admin` / `bairesbeef2024`) que **no son seguros para
   producción**.
3. **Subí tu logo real.** Se agregó un logo de placeholder
   (`public/logo.svg`) con la paleta de la marca. Reemplazalo desde
   *Configuración → Logo* en el panel de admin, o pisando el archivo.
4. **Cargá tus cortes y precios reales** desde `/admin/productos` (se
   incluyen ~20 cortes de ejemplo para que puedas ver la tienda andando).

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). El panel de admin está
en [http://localhost:3000/admin](http://localhost:3000/admin).

## Build de producción

```bash
npm run build
npm run start
```

## Importante sobre el hosting

Este proyecto guarda los datos (`data/*.json`) y las fotos subidas
(`data/uploads/`) **escribiendo archivos en el disco del servidor**, todo
dentro de la misma carpeta `data/` para que un solo disco persistente
alcance. Esto funciona perfecto en:

- Un VPS o servidor propio corriendo `npm run start` (Node.js) — con o sin
  Docker.
- Plataformas tipo Railway, Render, Fly.io, etc. con disco persistente.

**No funciona tal cual en Vercel** (u otro hosting serverless "sin estado"),
porque ahí el sistema de archivos es de solo lectura en producción y los
cambios del panel de administración se perderían. Si más adelante querés
desplegar en Vercel, avisame y migramos el almacenamiento a una base de
datos (por ejemplo Postgres o un blob storage) — la estructura del código ya
está preparada para ese cambio porque toda la lectura/escritura de datos
pasa por `src/lib/data.ts`.

## Stack

- Next.js 16 (App Router, Server Actions)
- TypeScript + Tailwind CSS v4
- Sin base de datos: JSON + filesystem
- Autenticación de admin propia (cookie firmada con HMAC), sin dependencias
  externas
