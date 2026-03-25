This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Multi-tenant branding

El proyecto soporta branding configurable por tenant (empresa) para:

- Colores (`color_primary`, `color_secondary`)
- Logo (`logo_url` remoto)
- Brand/nombre comercial (`brand_name`, `store_name`)
- Contacto (`address`, `phone`, `whatsapp`, `email`, `business_hours`, `map_embed_url`)
- SEO (`title`, `description`, `keywords`, `og_image_url`)

### Endpoint interno

- `GET /api/tenant/branding`
- Opcional: `?tenant=<slug>`

Respuesta:

```json
{
	"tenant": "default",
	"branding": { "...": "..." },
	"available_options": ["default", "demo"]
}
```

Las opciones por tenant se definen en `lib/tenantBranding.ts`.

También soporta actualización por runtime:

- `PUT /api/tenant/branding?tenant=<slug>`
- Body: `Partial<BrandConfig>`

> Nota: la persistencia actual es en memoria del proceso (ideal para demo/dev). Para producción, conectalo a base de datos o backend central.

### Resolución de tenant

`middleware.ts` resuelve tenant por este orden:

1. Query `?tenant=`
2. Subdominio (ej: `empresa.midominio.com` -> `empresa`)
3. Cookie `tenantSlug`
4. `NEXT_PUBLIC_DEFAULT_TENANT` (fallback)

### Panel admin

- Ruta: `/admin/branding`
- Requiere usuario autenticado con rol `admin` o `editor` (control en frontend)
- Permite editar marca, contacto y SEO del tenant actual

### Endpoint `/me/`

`AuthContext` ahora usa `/me/` al hidratar sesión para sincronizar el tenant/usuario real cuando existe token almacenado.

Si usás Django con rutas como:

- `/api/auth/login/`
- `/api/auth/refresh/`
- `/api/auth/me/`

el frontend ya está alineado (incluye fallback para variantes como `/token/refresh/`).

### Variables de entorno útiles

- `NEXT_PUBLIC_DEFAULT_TENANT=default`
- `NEXT_PUBLIC_LOGO_HOSTNAMES=cdn.empresa.com,assets.empresa2.com`
- `NEXT_PUBLIC_ENABLE_ME_SYNC=false`

`NEXT_PUBLIC_LOGO_HOSTNAMES` agrega dominios permitidos para `next/image`.

`NEXT_PUBLIC_ENABLE_ME_SYNC` controla si `AuthContext` consulta `/me` al hidratar sesión (`false` por defecto para evitar errores cuando ese endpoint no está disponible en dev).

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
