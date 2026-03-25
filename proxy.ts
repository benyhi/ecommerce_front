import { NextRequest, NextResponse } from "next/server";
import { resolveTenantSlug } from "@/lib/tenant";

export function proxy(request: NextRequest) {
  const tenantSlug = resolveTenantSlug({
    searchTenant: request.nextUrl.searchParams.get("tenant"),
    hostname: request.headers.get("host"),
    cookieTenant: request.cookies.get("tenantSlug")?.value,
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant", tenantSlug);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (request.cookies.get("tenantSlug")?.value !== tenantSlug) {
    response.cookies.set("tenantSlug", tenantSlug, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
