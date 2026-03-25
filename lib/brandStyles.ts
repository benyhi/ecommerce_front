import type { CSSProperties } from "react";
import type { BrandConfig } from "@/types";

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return [red, green, blue];
}

function rgbToHex(red: number, green: number, blue: number): string {
  const safeRed = Math.max(0, Math.min(255, Math.round(red)));
  const safeGreen = Math.max(0, Math.min(255, Math.round(green)));
  const safeBlue = Math.max(0, Math.min(255, Math.round(blue)));
  return `#${[safeRed, safeGreen, safeBlue]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function darkenHex(hex: string, amount = 0.16): string {
  const [red, green, blue] = hexToRgb(hex);
  return rgbToHex(red * (1 - amount), green * (1 - amount), blue * (1 - amount));
}

function alphaHex(hex: string, alpha = 0.14): string {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getBrandCssVariables(branding: BrandConfig): Record<string, string> {
  return {
    "--accent": branding.color_primary,
    "--accent2": branding.color_secondary,
    "--accent-hover": darkenHex(branding.color_primary),
    "--accent-light": alphaHex(branding.color_primary),
  };
}

export function getBrandCssStyle(branding: BrandConfig): CSSProperties {
  return getBrandCssVariables(branding) as CSSProperties;
}
