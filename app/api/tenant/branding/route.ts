import { NextRequest, NextResponse } from "next/server";
import {
  getBrandConfigForTenant,
  getTenantBrandingOptions,
  setTenantBrandingConfig,
} from "@/lib/tenantBranding";
import type { BrandConfig } from "@/types";
import { resolveTenantSlug } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const tenantSlug = resolveTenantSlug({
    searchTenant: request.nextUrl.searchParams.get("tenant"),
    hostname: request.headers.get("host"),
    cookieTenant: request.cookies.get("tenantSlug")?.value ?? request.headers.get("x-tenant"),
  });

  const branding = getBrandConfigForTenant(tenantSlug);
  const availableOptions = Object.keys(getTenantBrandingOptions());

  return NextResponse.json({
    tenant: tenantSlug,
    branding,
    available_options: availableOptions,
  });
}

export async function PUT(request: NextRequest) {
  const tenantSlug = resolveTenantSlug({
    searchTenant: request.nextUrl.searchParams.get("tenant"),
    hostname: request.headers.get("host"),
    cookieTenant: request.cookies.get("tenantSlug")?.value ?? request.headers.get("x-tenant"),
  });

  const payload = (await request.json()) as Partial<BrandConfig>;
  const branding = setTenantBrandingConfig(tenantSlug, payload);

  return NextResponse.json({
    tenant: tenantSlug,
    branding,
    available_options: Object.keys(getTenantBrandingOptions()),
  });
}
