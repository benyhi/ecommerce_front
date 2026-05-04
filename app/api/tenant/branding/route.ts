import { NextRequest, NextResponse } from "next/server";
import {
  getBrandConfigForTenant,
  getTenantBrandingOptions,
} from "@/lib/tenantBranding";
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
