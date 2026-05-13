# AGENTS.md — Next.js Multi-tenant Branding

## Project context

This is a Next.js app created with `create-next-app`. It includes a multi-tenant branding system used to customize the storefront/admin experience per tenant.

The project runs locally at:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Core responsibilities

When modifying this project, preserve the existing multi-tenant behavior:

- Branding must be resolved per tenant.
- Tenant fallback behavior must remain predictable.
- Admin branding changes must affect only the selected tenant.
- Runtime branding updates are currently in-memory only and must not be treated as production persistence.

## Multi-tenant branding

Branding supports the following tenant-specific values:

- Primary and secondary colors.
- Remote logo URL.
- Brand name and store name.
- Contact information: address, phone, WhatsApp, email, business hours and map embed URL.
- SEO metadata: title, description, keywords and Open Graph image URL.

Tenant branding options are defined in:

```text
lib/tenantBranding.ts
```

## Tenant branding API

Internal endpoint:

```http
GET /api/tenant/branding
```

Optional tenant query:

```http
GET /api/tenant/branding?tenant=<slug>
```

Expected response shape:

```json
{
  "tenant": "default",
  "branding": {},
  "available_options": ["default", "demo"]
}
```

Runtime update endpoint:

```http
PUT /api/tenant/branding?tenant=<slug>
```

Body:

```ts
Partial<BrandConfig>
```

Important: current persistence is in memory for demo/development. For production, connect this flow to a database or central backend.

## Tenant resolution

`middleware.ts` resolves the tenant in this order:

1. Query parameter: `?tenant=<slug>`
2. Subdomain: `empresa.midominio.com` resolves to `empresa`
3. Cookie: `tenantSlug`
4. Environment fallback: `NEXT_PUBLIC_DEFAULT_TENANT`

Do not change this order unless the product requirement explicitly asks for it.

## Admin branding panel

Branding can be edited from:

```text
/admin/branding
```

Access is controlled in the frontend and requires an authenticated user with role:

- `admin`
- `editor`

The panel edits:

- Brand identity
- Contact information
- SEO metadata

## Authentication notes

`AuthContext` can hydrate the session using the `/me/` endpoint to sync the real user and tenant when a token exists.

Expected Django backend routes:

```http
POST /api/auth/login/
POST /api/auth/refresh/
GET  /api/auth/me/
```

The frontend also includes fallback support for token refresh route variants such as:

```http
/token/refresh/
```

`NEXT_PUBLIC_ENABLE_ME_SYNC` controls whether `AuthContext` calls `/me` during hydration.

Default behavior:

```env
NEXT_PUBLIC_ENABLE_ME_SYNC=false
```

This avoids development errors when the `/me` endpoint is unavailable.

## Environment variables

```env
NEXT_PUBLIC_DEFAULT_TENANT=default
NEXT_PUBLIC_LOGO_HOSTNAMES=cdn.empresa.com,assets.empresa2.com
NEXT_PUBLIC_ENABLE_ME_SYNC=false
```

Use `NEXT_PUBLIC_LOGO_HOSTNAMES` to allow remote logo domains for `next/image`.

## Development guidelines for Codex

When editing code:

- Keep tenant resolution centralized in `middleware.ts`.
- Keep brand config types aligned with `BrandConfig`.
- Avoid hardcoding brand values in components.
- Read branding values from the tenant branding layer.
- Preserve support for query, subdomain, cookie and fallback tenant resolution.
- Do not assume in-memory updates are permanent.
- Keep admin access checks compatible with `admin` and `editor`.
- When changing remote image behavior, update the allowed logo hostnames configuration.
- Avoid introducing global branding state that ignores the current tenant.

## Files likely involved

```text
middleware.ts
lib/tenantBranding.ts
app/api/tenant/branding/route.ts
context/AuthContext.tsx
app/admin/branding/
next.config.*
```

## Common tasks

### Add a new branding field

1. Add it to `BrandConfig`.
2. Add a default value in `lib/tenantBranding.ts`.
3. Include it in the API response/update flow.
4. Add or update the admin branding form field.
5. Update any component that consumes that value.

### Connect branding persistence to a backend

1. Replace the in-memory store behind `/api/tenant/branding`.
2. Fetch/update branding from the backend or database.
3. Keep the public response shape stable.
4. Preserve tenant resolution behavior.
5. Handle missing tenant config with the default tenant fallback.

### Add a new logo domain

1. Add the hostname to `NEXT_PUBLIC_LOGO_HOSTNAMES`.
2. Ensure `next/image` config reads it.
3. Validate that remote images still load in development and production.
