# Baires Beef

Tienda online de carnes con sección minorista (catálogo + carrito) y
mayorista (landing + consulta), pedidos que se cierran por WhatsApp, y un
panel de administración para cambiar precios y fotos de cada corte.

## Cómo está organizado

- **`/`** — Home con hero, destacados, categorías y accesos a minorista/mayorista.
- **`/tienda`** — Catálogo minorista con filtro por categoría, buscador,
  carrito (persistido en el navegador) y botón **"Finalizar por WhatsApp"**
  que arma el mensaje con el detalle del pedido y el total.
- **`/mayorista`** — Landing mayorista con beneficios y un formulario corto
  (negocio, rubro, detalle) que arma un mensaje y abre WhatsApp directo.
- **`/nosotros`**, **`/contacto`** — Institucional y datos de contacto.
- **`/admin`** — Panel protegido con usuario/contraseña para gestionar:
  - **Productos**: alta/edición/baja, precio, unidad (kg o unidad), foto,
    activo/inactivo, destacado en el home.
  - **Categorías**: alta/edición/orden/baja.
  - **Configuración**: nombre, logo, números de WhatsApp (minorista y
    mayorista), textos de la sección mayorista, dirección, horarios, email,
    Instagram.

Los datos de productos, categorías y configuración se guardan en archivos
JSON dentro de `data/` (sin base de datos externa). Las fotos que se suben
desde el panel se guardan en `data/uploads/` y se sirven por una ruta propia
(`/uploads/<archivo>`) — así, con un único disco persistente montado en
`/app/data` alcanza para que no se pierda nada (precios, categorías y fotos).

## Antes de poner esto en producción

1. **Cargá tu WhatsApp real.** Por defecto están en `5491100000000`
   (placeholder). Cambialos desde `/admin/configuracion` apenas tengas
   acceso, o editando `data/settings.json` antes de desplegar.
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
