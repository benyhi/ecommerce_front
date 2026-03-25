"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    toggleTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage after mount to avoid hydration mismatch
    useEffect(() => {
        const stored = localStorage.getItem("theme") as Theme | null;
        const initialTheme = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        setTheme(initialTheme);
        setMounted(true);
    }, []);

    function applyTheme(t: Theme) {
        const root = document.documentElement;
        if (t === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }

    useEffect(() => {
        if (mounted) {
            applyTheme(theme);
        }
    }, [theme, mounted]);

    function toggleTheme() {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            localStorage.setItem("theme", next);
            applyTheme(next);
            return next;
        });
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
