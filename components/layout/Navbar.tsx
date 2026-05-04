"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    ActionIcon,
    Badge,
    Box,
    Burger,
    Collapse,
    Divider,
    Group,
    Indicator,
    Menu,
    Text,
    UnstyledButton,
} from "@mantine/core";
import {
    ShoppingCart, User, Sun, Moon, Monitor,
    LogOut, Settings, ChevronDown, Zap
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandContext";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/catalogo", label: "Catálogo" },
    { href: "/ayuda", label: "Ayuda" },
];

export default function Navbar() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { itemCount, openCart } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const { branding } = useBranding();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const logoUrl = (branding.logo_url as unknown as string | null) ?? null;
    const iconBtnStyle: React.CSSProperties = {
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        cursor: "pointer",
        color: "var(--text-secondary)",
        transition: "var(--transition)",
    };

    function handleLogout() {
        logout();
        setUserMenuOpen(false);
    }

    const userMenuContent = isAuthenticated ? (
        <>
            <Box style={{ padding: "1rem", borderBottom: "1px solid var(--border)" }}>
                <Text style={{ fontWeight: 600, fontSize: ".875rem", color: "var(--text-primary)" }}>
                    {user?.first_name} {user?.last_name}
                </Text>
                <Text style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>{user?.email}</Text>
                <Badge variant="light" color="brand" radius="xl" mt={4}>
                    {user?.role}
                </Badge>
            </Box>
            <Box style={{ padding: ".5rem" }}>
                <MenuBtn icon={<Settings size={14} />} label="Perfil" onClick={() => setUserMenuOpen(false)} />
                <MenuBtn icon={<LogOut size={14} />} label="Cerrar sesión" onClick={handleLogout} danger />
            </Box>
        </>
    ) : (
        <Box style={{ padding: ".5rem" }}>
            <MenuBtn
                icon={<User size={14} />}
                label="Iniciar sesión"
                onClick={() => { setShowLogin(true); setUserMenuOpen(false); }}
            />
            <MenuBtn
                icon={<Monitor size={14} />}
                label="Registrarse"
                onClick={() => { setShowRegister(true); setUserMenuOpen(false); }}
            />
        </Box>
    );

    return (
        <>
            <Box
                component="header"
                style={{
                    background: "var(--bg-secondary)",
                    borderBottom: "1px solid var(--border)",
                    position: "sticky",
                    top: 0,
                    zIndex: 30,
                    boxShadow: "var(--shadow-sm)",
                }}
            >
                <Group
                    style={{
                        maxWidth: 1280,
                        margin: "0 auto",
                        padding: "0 1.5rem",
                        height: 64,
                        gap: "1rem",
                    }}
                    justify="space-between"
                    wrap="nowrap"
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        style={{
                            display: "flex", alignItems: "center", gap: ".5rem",
                            textDecoration: "none", flexShrink: 0,
                        }}
                    >
                        {logoUrl && !logoError ? (
                            <Image
                                src={logoUrl}
                                alt={`Logo ${branding.brand_name}`}
                                width={34}
                                height={34}
                                onError={() => setLogoError(true)}
                                style={{ borderRadius: 8, objectFit: "cover" }}
                                unoptimized={logoUrl.startsWith("data:")}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 34, height: 34,
                                    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                                    borderRadius: 8,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}
                            >
                                <Zap size={18} color={branding.color_primary_text} strokeWidth={2.5} />
                            </div>
                        )}
                        <span
                            style={{
                                fontWeight: 700, fontSize: "1.125rem",
                                color: "var(--text-primary)",
                                letterSpacing: "-.02em",
                            }}
                        >
                            {branding.brand_name}
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <Group visibleFrom="md" style={{ flex: 1, justifyContent: "center", gap: ".25rem" }}>
                        {navLinks.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                style={{
                                    padding: ".45rem .85rem",
                                    borderRadius: 8,
                                    fontSize: ".875rem",
                                    fontWeight: pathname === l.href ? 600 : 500,
                                    color: pathname === l.href ? "var(--accent)" : "var(--text-secondary)",
                                    background: pathname === l.href ? "var(--accent-light)" : "transparent",
                                    textDecoration: "none",
                                    transition: "var(--transition)",
                                }}
                                onMouseEnter={(e) => {
                                    if (pathname !== l.href) {
                                        (e.target as HTMLElement).style.color = "var(--accent)";
                                        (e.target as HTMLElement).style.background = "var(--accent-light)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (pathname !== l.href) {
                                        (e.target as HTMLElement).style.color = "var(--text-secondary)";
                                        (e.target as HTMLElement).style.background = "transparent";
                                    }
                                }}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </Group>

                    {/* Actions - Desktop only */}
                    <Group visibleFrom="md" gap="xs">
                        {/* Dark/Light toggle */}
                        <ActionIcon
                            onClick={toggleTheme}
                            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
                            style={iconBtnStyle}
                            variant="transparent"
                            radius="md"
                            size={36}
                            suppressHydrationWarning
                        >
                            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                        </ActionIcon>

                        {/* Cart */}
                        <Indicator
                            disabled={itemCount <= 0}
                            label={itemCount > 99 ? "99+" : itemCount}
                            size={18}
                            radius="xl"
                            styles={{
                                indicator: {
                                    background: "var(--accent)",
                                    color: "#fff",
                                    border: "2px solid var(--bg-secondary)",
                                    fontSize: ".65rem",
                                    fontWeight: 700,
                                    minWidth: 18,
                                    height: 18,
                                    top: -6,
                                    right: -6,
                                },
                            }}
                        >
                            <ActionIcon
                                onClick={openCart}
                                title="Carrito"
                                style={iconBtnStyle}
                                variant="transparent"
                                radius="md"
                                size={36}
                            >
                                <ShoppingCart size={16} />
                            </ActionIcon>
                        </Indicator>

                        {/* User menu */}
                        <Menu
                            opened={userMenuOpen}
                            onChange={setUserMenuOpen}
                            position="bottom-end"
                            offset={8}
                            shadow="md"
                            width={220}
                            withinPortal={false}
                        >
                            <Menu.Target>
                                <UnstyledButton
                                    onClick={() => setUserMenuOpen((o) => !o)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: ".4rem",
                                        background: "var(--bg-elevated)",
                                        border: `1px solid var(--border)`,
                                        borderRadius: 8,
                                        height: 36,
                                        minWidth: 36,
                                        padding: "0 .7rem",
                                        cursor: "pointer", color: "var(--text-secondary)",
                                        fontSize: ".8rem", fontWeight: 500,
                                        transition: "var(--transition)",
                                    }}
                                >
                                    <User size={16} />
                                    {isAuthenticated && (
                                        <span className="hidden sm:inline">{user?.first_name || user?.username}</span>
                                    )}
                                    <ChevronDown size={12} style={{
                                        transform: userMenuOpen ? "rotate(180deg)" : "rotate(0)",
                                        transition: "transform .2s",
                                    }} />
                                </UnstyledButton>
                            </Menu.Target>

                            <Menu.Dropdown
                                style={{
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 12,
                                    boxShadow: "var(--shadow-lg)",
                                    overflow: "hidden",
                                }}
                            >
                                {userMenuContent}
                            </Menu.Dropdown>
                        </Menu>
                    </Group>

                    {/* Mobile actions - right aligned */}
                    <Group hiddenFrom="md" gap="xs" wrap="nowrap" style={{ marginLeft: "auto" }}>
                        <Menu
                            position="bottom-end"
                            offset={8}
                            shadow="md"
                            width={220}
                            withinPortal={false}
                        >
                            <Menu.Target>
                                <ActionIcon
                                    title={isAuthenticated ? "Perfil" : "Acceder"}
                                    style={iconBtnStyle}
                                    variant="transparent"
                                    radius="md"
                                    size={36}
                                >
                                    <User size={16} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown
                                style={{
                                    background: "var(--bg-secondary)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 12,
                                    boxShadow: "var(--shadow-lg)",
                                    overflow: "hidden",
                                }}
                            >
                                {userMenuContent}
                            </Menu.Dropdown>
                        </Menu>

                        <Burger
                            onClick={() => setMobileOpen((o) => !o)}
                            opened={mobileOpen}
                            color={theme === "dark" ? "#fff" : undefined}
                            style={{
                                ...iconBtnStyle,
                                color: theme === "dark" ? "#fff" : "var(--text-secondary)",
                            }}
                            size="sm"
                        />
                    </Group>
                </Group>

                {/* Mobile menu */}
                <Collapse in={mobileOpen} transitionDuration={180}>
                    <Box
                        hiddenFrom="md"
                        style={{
                            background: "var(--bg-secondary)",
                            borderTop: "1px solid var(--border)",
                            padding: "1rem 1.5rem",
                            display: "flex", flexDirection: "column", gap: ".25rem",
                        }}
                    >
                        {navLinks.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setMobileOpen(false)}
                                style={{
                                    padding: ".65rem 1rem",
                                    borderRadius: 8,
                                    fontSize: ".9rem",
                                    fontWeight: pathname === l.href ? 600 : 500,
                                    color: pathname === l.href ? "var(--accent)" : "var(--text-secondary)",
                                    background: pathname === l.href ? "var(--accent-light)" : "transparent",
                                    textDecoration: "none",
                                }}
                            >
                                {l.label}
                            </Link>
                        ))}

                        <Divider style={{ borderColor: "var(--border)", margin: ".5rem -1.5rem", marginTop: ".5rem" }} />

                        {/* Mobile Actions */}
                        <UnstyledButton
                            onClick={toggleTheme}
                            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
                            style={{
                                width: "100%",
                                textAlign: "left",
                                display: "flex", alignItems: "center", gap: ".5rem",
                                padding: ".65rem 1rem",
                                borderRadius: 8,
                                border: "none",
                                background: "transparent",
                                color: "var(--text-secondary)",
                                fontSize: ".9rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "var(--transition)",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                            }}
                        >
                            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                            <span>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
                        </UnstyledButton>

                        <UnstyledButton
                            onClick={openCart}
                            title="Carrito"
                            style={{
                                width: "100%",
                                textAlign: "left",
                                display: "flex", alignItems: "center", gap: ".5rem",
                                padding: ".65rem 1rem",
                                borderRadius: 8,
                                border: "none",
                                background: "transparent",
                                color: "var(--text-secondary)",
                                fontSize: ".9rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "var(--transition)",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.background = "transparent";
                            }}
                        >
                            <ShoppingCart size={16} />
                            <span>Carrito {itemCount > 0 && `(${itemCount})`}</span>
                        </UnstyledButton>

                    </Box>
                </Collapse>
            </Box>

            {showLogin && (
                <LoginModal
                    onClose={() => setShowLogin(false)}
                    onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
                />
            )}
            {showRegister && (
                <RegisterModal
                    onClose={() => setShowRegister(false)}
                    onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
                />
            )}
        </>
    );
}

function MenuBtn({
    icon, label, onClick, danger,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <UnstyledButton
            onClick={onClick}
            style={{
                width: "100%", textAlign: "left",
                display: "flex", alignItems: "center", gap: ".6rem",
                padding: ".6rem .75rem",
                borderRadius: 8, border: "none", background: "transparent",
                color: danger ? "var(--danger)" : "var(--text-secondary)",
                fontSize: ".875rem", fontWeight: 500, cursor: "pointer",
                transition: "var(--transition)",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = danger
                    ? "rgba(239,68,68,.08)"
                    : "var(--bg-elevated)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
        >
            {icon}
            {label}
        </UnstyledButton>
    );
}
