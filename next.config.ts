import type { NextConfig } from "next";

const extraLogoHostnames = (process.env.NEXT_PUBLIC_LOGO_HOSTNAMES ?? "")
  .split(",")
  .map((hostname) => hostname.trim())
  .filter(Boolean)
  .map((hostname) => ({
    protocol: "https" as const,
    hostname,
  }));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash — mock/demo images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Production CDN — ajustá el hostname a tu dominio real (ej: cdn.midominio.com)
      {
        protocol: "https",
        hostname: "cdn.midominio.com",
      },
      // API server images (en caso de que sirvan imágenes directo desde el backend)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      ...extraLogoHostnames,
    ],
  },
};

export default nextConfig;
