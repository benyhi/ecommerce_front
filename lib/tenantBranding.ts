import type { BrandConfig } from "@/types";

type BrandConfigOverrides = Partial<Omit<BrandConfig, "contact" | "seo">> & {
  contact?: Partial<BrandConfig["contact"]>;
  seo?: Partial<BrandConfig["seo"]>;
};

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6})$/;

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  store_name: "TechStore",
  brand_name: "TechStore",
  logo_url: null,
  color_primary: "#6366f1",
  color_secondary: "#06b6d4",
  color_background: "#363636",
  color_primary_text: "#ffffff",
  tagline:
    "Tu destino tecnológico de confianza. Los mejores productos al mejor precio con garantía oficial.",
  contact: {
    address: "Av. Tecnología 1234, Buenos Aires",
    phone: "+54 11 1234-5678",
    whatsapp: "+54 9 11 1234-5678",
    email: "info@techstore.com.ar",
    business_hours: "Lun–Vie 9:00–18:00 · Sáb 10:00–14:00",
    map_embed_url:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.9925814817217!2d-58.38376!3d-34.60376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacf36f66a53%3A0x3768a67e65df46ab!2sObelisco!5e0!3m2!1ses-419!2sar!4v1696000000000!5m2!1ses-419!2sar",
    map_title: "Ubicación TechStore",
  },
  seo: {
    title: "TechStore — Tecnología al mejor precio",
    description:
      "TechStore: laptops, smartphones, audio, accesorios y mucho más. Envío a todo el país.",
    keywords: "tecnología, laptops, smartphones, auriculares, accesorios tech",
  },
};

const TENANT_BRANDING_OPTIONS: Record<string, BrandConfigOverrides> = {
  default: {},
  demo: {
    store_name: "Demo Electronics",
    brand_name: "Demo Electronics",
    logo_url:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=120&q=80",
    color_primary: "#7c3aed",
    color_secondary: "#14b8a6",
    color_background: "#1f2937",
    tagline: "Equipá tu negocio con tecnología confiable y soporte experto.",
    contact: {
      address: "Av. Demo 555, Ciudad Demo",
      phone: "+54 11 5555-0000",
      whatsapp: "+54 9 11 5555-0000",
      email: "contacto@demoelectronics.com",
      business_hours: "Lun–Vie 8:30–18:30 · Sáb 10:00–13:00",
      map_embed_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.9925814817217!2d-58.38376!3d-34.60376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacf36f66a53%3A0x3768a67e65df46ab!2sObelisco!5e0!3m2!1ses-419!2sar!4v1696000000000!5m2!1ses-419!2sar",
      map_title: "Ubicación Demo Electronics",
    },
    seo: {
      title: "Demo Electronics — Soluciones tech para tu empresa",
      description:
        "Demo Electronics: equipamiento tecnológico, asesoría especializada y envíos a todo el país.",
      keywords: "tecnología, empresas, equipamiento, hardware, accesorios",
    },
  },
};

const runtimeOverrides: Record<string, BrandConfigOverrides> = {};

function mergeBrandConfig(overrides: BrandConfigOverrides): BrandConfig {
  const merged: BrandConfig = {
    ...DEFAULT_BRAND_CONFIG,
    ...overrides,
    contact: {
      ...DEFAULT_BRAND_CONFIG.contact,
      ...overrides.contact,
    },
    seo: {
      ...DEFAULT_BRAND_CONFIG.seo,
      ...overrides.seo,
    },
  };

  if (!HEX_COLOR_REGEX.test(merged.color_primary)) {
    merged.color_primary = DEFAULT_BRAND_CONFIG.color_primary;
  }
  if (!HEX_COLOR_REGEX.test(merged.color_secondary)) {
    merged.color_secondary = DEFAULT_BRAND_CONFIG.color_secondary;
  }

  return merged;
}

export function getBrandConfigForTenant(tenantSlug?: string | null): BrandConfig {
  const slug = tenantSlug?.trim().toLowerCase() || "default";
  const baseOverrides = TENANT_BRANDING_OPTIONS[slug] ?? TENANT_BRANDING_OPTIONS.default;
  const runtime = runtimeOverrides[slug];
  if (!runtime) {
    return mergeBrandConfig(baseOverrides ?? {});
  }

  return mergeBrandConfig({
    ...(baseOverrides ?? {}),
    ...runtime,
    contact: {
      ...(baseOverrides?.contact ?? {}),
      ...(runtime.contact ?? {}),
    },
    seo: {
      ...(baseOverrides?.seo ?? {}),
      ...(runtime.seo ?? {}),
    },
  });
}

export function getTenantBrandingOptions(): Record<string, BrandConfigOverrides> {
  return {
    ...TENANT_BRANDING_OPTIONS,
    ...runtimeOverrides,
  };
}

export function setTenantBrandingConfig(
  tenantSlug: string,
  overrides: BrandConfigOverrides
): BrandConfig {
  const slug = tenantSlug.trim().toLowerCase() || "default";
  const previous = runtimeOverrides[slug] ?? {};

  runtimeOverrides[slug] = {
    ...previous,
    ...overrides,
    contact: {
      ...(previous.contact ?? {}),
      ...(overrides.contact ?? {}),
    },
    seo: {
      ...(previous.seo ?? {}),
      ...(overrides.seo ?? {}),
    },
  };

  return getBrandConfigForTenant(slug);
}
