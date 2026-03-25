import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { ColorSchemeScript } from "@mantine/core";
import { BrandProvider } from "@/contexts/BrandContext";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import { getBrandCssStyle } from "@/lib/brandStyles";
import { resolveTenantSlug } from "@/lib/tenant";
import { getBrandConfigForTenant } from "@/lib/tenantBranding";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

async function getRequestBranding() {
  const headerStore = await headers();
  const cookieStore = await cookies();

  const tenantSlug = resolveTenantSlug({
    hostname: headerStore.get("host"),
    cookieTenant: headerStore.get("x-tenant") ?? cookieStore.get("tenantSlug")?.value,
  });

  return {
    tenantSlug,
    branding: getBrandConfigForTenant(tenantSlug),
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { branding } = await getRequestBranding();

  return {
    title: branding.seo.title,
    description: branding.seo.description,
    keywords: branding.seo.keywords,
    openGraph: {
      title: branding.seo.title,
      description: branding.seo.description,
      images: branding.seo.seo_image ? [branding.seo.seo_image] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { branding } = await getRequestBranding();

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.variable} style={getBrandCssStyle(branding)}>
        <BrandProvider branding={branding}>
          <Providers>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
            </div>
          </Providers>
        </BrandProvider>
      </body>
    </html>
  );
}
