"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import type { User } from "@/types";
import { getMeApi, loginApi, registerApi } from "@/lib/api";

const ENABLE_ME_SYNC = false;
const DEFAULT_TENANT = "tienda1";

// ─── Tenant slug detection ────────────────────────────────────────────────

function detectTenantSlug(): string {
    // Only runs client-side
    if (typeof window === "undefined") return "";

    // Subdomain: tienda.dominio.com → "tienda"
    const hostParts = window.location.hostname.split(".");
    if (hostParts.length >= 3) {
        const subdomain = hostParts[0];
        if (subdomain !== "www") {
            return subdomain;
        }
    }

    return DEFAULT_TENANT;
}

// ─── Context type ─────────────────────────────────────────────────────────

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    tenantSlug: string;
    isAuthenticated: boolean;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    register: (data: {
        username: string;
        email: string;
        password: string;
        first_name?: string;
        last_name?: string;
    }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ─── Provider ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [tenantSlug, setTenantSlug] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Hydrate from localStorage on mount
    useEffect(() => {
        async function hydrateUser() {
            const slug = detectTenantSlug();
            setTenantSlug(slug);

            const storedToken = localStorage.getItem("accessToken");
            const storedUser = localStorage.getItem("user");

            if (storedToken && storedUser) {
                setAccessToken(storedToken);
                if (ENABLE_ME_SYNC) {
                    try {
                        const me = await getMeApi(storedToken, slug);
                        setUser(me);
                        const resolvedSlug = me.tenant?.slug ?? slug;
                        setTenantSlug(resolvedSlug);
                        localStorage.setItem("tenantSlug", resolvedSlug);
                        localStorage.setItem("user", JSON.stringify(me));
                    } catch {
                        setUser(JSON.parse(storedUser));
                    }
                } else {
                    setUser(JSON.parse(storedUser));
                }
            }
            setLoading(false);
        }

        void hydrateUser();
    }, []);

    const login = useCallback(
        async (username: string, password: string) => {
            const res = await loginApi(username, password, tenantSlug);
            setAccessToken(res.access);
            setUser(res.user);
            // Update tenant slug from the user's actual tenant
            const slug = res.user.tenant?.slug ?? tenantSlug;
            setTenantSlug(slug);
            localStorage.setItem("accessToken", res.access);
            localStorage.setItem("refreshToken", res.refresh);
            localStorage.setItem("user", JSON.stringify(res.user));
            localStorage.setItem("tenantSlug", slug);
        },
        [tenantSlug]
    );

    const logout = useCallback(() => {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
    }, []);

    const register = useCallback(
        async (data: {
            username: string;
            email: string;
            password: string;
            first_name?: string;
            last_name?: string;
        }) => {
            const res = await registerApi(data, tenantSlug);
            setAccessToken(res.access);
            setUser(res.user);
            const slug = res.user.tenant?.slug ?? tenantSlug;
            setTenantSlug(slug);
            localStorage.setItem("accessToken", res.access);
            localStorage.setItem("refreshToken", res.refresh);
            localStorage.setItem("user", JSON.stringify(res.user));
            localStorage.setItem("tenantSlug", slug);
        },
        [tenantSlug]
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                tenantSlug,
                isAuthenticated: !!user && !!accessToken,
                loading,
                login,
                logout,
                register,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
