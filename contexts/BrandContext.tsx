"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { BrandConfig } from "@/types";
import { getBrandCssVariables } from "@/lib/brandStyles";

type BrandContextValue = {
  branding: BrandConfig;
};

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

export function BrandProvider({
  branding,
  children,
}: {
  branding: BrandConfig;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ branding }), [branding]);
  const cssVars = getBrandCssVariables(branding);

  return (
    <BrandContext.Provider value={value}>
      <div style={cssVars}>{children}</div>
    </BrandContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBranding must be used inside BrandProvider");
  }
  return context;
}
