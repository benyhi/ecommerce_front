export interface ResolveTenantSlugParams {
  searchTenant?: string | null;
  hostname?: string | null;
  cookieTenant?: string | null;
}

const RESERVED_SUBDOMAINS = new Set(["www", "localhost"]);

export function getDefaultTenantSlug(): string {
  return "tienda1";
}

export function normalizeTenantSlug(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
}

export function getTenantFromHostname(hostname?: string | null): string | null {
  if (!hostname) return null;

  const host = hostname.split(":")[0].toLowerCase();
  const parts = host.split(".");
  if (parts.length < 3) return null;

  const subdomain = parts[0];
  if (RESERVED_SUBDOMAINS.has(subdomain)) return null;

  return normalizeTenantSlug(subdomain);
}

export function resolveTenantSlug({
  searchTenant,
  hostname,
  cookieTenant,
}: ResolveTenantSlugParams): string {
  return (
    getTenantFromHostname(hostname) ??
    normalizeTenantSlug(searchTenant) ??
    normalizeTenantSlug(cookieTenant) ??
    getDefaultTenantSlug()
  );
}
