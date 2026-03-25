import type { Category, ProductReadOnly, LoginResponse, BrandConfig } from "@/types";
import type { User } from "@/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(
    /\/+$/,
    ""
);
const DEFAULT_TENANT = "tienda1";
const AUTH_LOGIN_PATH = "/auth/login/";

// ─── Core fetch wrapper ───────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
    token?: string;
    tenantSlug?: string;
}

interface TenantBrandingApiResponse {
    tenant: string;
    branding: BrandConfig;
    available_options: string[];
}

type TenantBrandingPayload = Partial<BrandConfig> & {
    contact?: Partial<BrandConfig["contact"]>;
    seo?: Partial<BrandConfig["seo"]>;
};

export async function apiFetch<T>(
    path: string,
    { token, tenantSlug, ...rest }: FetchOptions = {}
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(rest.headers as Record<string, string>),
    };

    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (tenantSlug) headers["X-Tenant"] = tenantSlug;

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${API_BASE}${normalizedPath}`;
    const res = await fetch(url, { ...rest, headers });

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`API error ${res.status}: ${errorBody}`);
    }

    return res.json() as Promise<T>;
}

// ─── Catalog endpoints ────────────────────────────────────────────────────

export async function getCategories(
    token?: string,
    tenantSlug?: string
): Promise<Category[]> {
    return apiFetch<Category[]>("/menu/categories/", { token, tenantSlug });
}

export async function getProduct(
    id: number,
    token?: string,
    tenantSlug?: string
): Promise<ProductReadOnly> {
    return apiFetch<ProductReadOnly>(`/menu/products/${id}/`, {
        token,
        tenantSlug,
    });
}

// ─── Tenant Branding endpoint ─────────────────────────────────────────────

/**
 * Fetches visual brand settings for the current tenant.
 * GET /api/tenant/branding/   (X-Tenant header injected automatically)
 */
export async function getTenantBranding(tenantSlug?: string): Promise<BrandConfig> {
    try {
        const query = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : "";
        const res = await fetch(`/api/tenant/branding${query}`, {
            cache: "no-store",
            headers: tenantSlug ? { "X-Tenant": tenantSlug } : undefined,
        });

        if (res.ok) {
            const payload = (await res.json()) as TenantBrandingApiResponse;
            return payload.branding;
        }
    } catch {
        // fallback below
    }

    return apiFetch<BrandConfig>("/tenant/branding/", { tenantSlug });
}

export async function updateTenantBrandingConfig(
    data: TenantBrandingPayload,
    tenantSlug?: string
): Promise<BrandConfig> {
    const query = tenantSlug ? `?tenant=${encodeURIComponent(tenantSlug)}` : "";
    const res = await fetch(`/api/tenant/branding${query}`, {
        method: "PUT",
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...(tenantSlug ? { "X-Tenant": tenantSlug } : {}),
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Branding update error ${res.status}: ${errorBody}`);
    }

    const payload = (await res.json()) as TenantBrandingApiResponse;
    return payload.branding;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────

export async function loginApi(
    username: string,
    password: string,
    tenantSlug?: string
): Promise<LoginResponse> {
    const resolvedTenant = tenantSlug?.trim() || DEFAULT_TENANT;
    const payload = {
        email: username.trim(),
        password,
        tenant: resolvedTenant,
    };

    return apiFetch<LoginResponse>(AUTH_LOGIN_PATH, {
        method: "POST",
        body: JSON.stringify(payload),
        tenantSlug: resolvedTenant,
    });
}

export async function getMeApi(token: string, tenantSlug?: string): Promise<User> {
    const candidates = ["/me/", "/auth/me/"];
    let lastError: Error | null = null;

    for (const path of candidates) {
        try {
            return await apiFetch<User>(path, {
                method: "GET",
                token,
                tenantSlug,
            });
        } catch (error) {
            lastError = error instanceof Error ? error : new Error("Unknown /me error");
        }
    }

    throw lastError ?? new Error("Unable to fetch current user profile");
}

export async function registerApi(
    data: {
        username: string;
        email: string;
        password: string;
        first_name?: string;
        last_name?: string;
    },
    tenantSlug?: string
): Promise<LoginResponse> {
    const candidates = ["/auth/register/", "/auth/signup/"];

    for (const path of candidates) {
        try {
            return await apiFetch<LoginResponse>(path, {
                method: "POST",
                body: JSON.stringify(data),
                tenantSlug,
            });
        } catch {
            // try next candidate
        }
    }

    throw new Error(
        "No se encontró endpoint de registro en backend. Habilitá /api/auth/register/ (o /signup/) o registrá usuarios desde admin."
    );
}

export async function refreshTokenApi(
    refresh: string,
    tenantSlug?: string
): Promise<{ access: string }> {
    const candidates = ["/auth/refresh/", "/auth/token/refresh/"];
    let lastError: Error | null = null;

    for (const path of candidates) {
        try {
            return await apiFetch<{ access: string }>(path, {
                method: "POST",
                body: JSON.stringify({ refresh }),
                tenantSlug,
            });
        } catch (error) {
            lastError = error instanceof Error ? error : new Error("Unknown refresh error");
        }
    }

    throw lastError ?? new Error("Unable to refresh access token");
}
