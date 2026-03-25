"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { mantineTheme } from "@/lib/mantineTheme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={mantineTheme}>
      <Notifications position="top-right" />
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </MantineProvider>
  );
}
