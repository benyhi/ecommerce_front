"use client";

import Link from "next/link";
import Image from "next/image";
import { Box, Divider, Group, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core";
import { Zap, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from "lucide-react";
import { useState } from "react";
import { useBranding } from "@/contexts/BrandContext";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { branding } = useBranding();
    const [logoError, setLogoError] = useState(false);
    const logoUrl = (branding.logo_url as unknown as string | null) ?? null;

    return (
        <Box
            component="footer"
            style={{
                background: "var(--bg-secondary)",
                borderTop: "1px solid var(--border)",
                paddingTop: "3rem",
                paddingBottom: "1.5rem",
                marginTop: "auto",
            }}
        >
            <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
                <SimpleGrid
                    cols={{ base: 1, sm: 2, lg: 4 }}
                    style={{
                        gap: "2.5rem",
                        marginBottom: "2.5rem",
                    }}
                >
                    {/* Brand */}
                    <Box>
                        <Group gap="xs" mb="md" wrap="nowrap">
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
                                <Box
                                    style={{
                                        width: 34,
                                        height: 34,
                                        background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                                        borderRadius: 8,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Zap size={18} color={branding.color_primary_text} strokeWidth={2.5} />
                                </Box>
                            )}
                            <Text style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                                {branding.brand_name}
                            </Text>
                        </Group>
                        <Text style={{ color: "var(--text-muted)", fontSize: ".875rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                            {branding.tagline}
                        </Text>
                        <Group gap="xs">
                            {[
                                { icon: <Instagram size={16} />, href: "#", label: "Instagram" },
                                { icon: <Twitter size={16} />, href: "#", label: "Twitter" },
                                { icon: <Facebook size={16} />, href: "#", label: "Facebook" },
                            ].map((s) => (
                                <UnstyledButton
                                    component="a"
                                    key={s.label}
                                    href={s.href}
                                    title={s.label}
                                    style={{
                                        width: 34,
                                        height: 34,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "var(--bg-elevated)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 8,
                                        color: "var(--text-muted)",
                                        transition: "var(--transition)",
                                        textDecoration: "none",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                                        (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                                        (e.currentTarget as HTMLElement).style.background = "var(--accent-light)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                                        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                                        (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                                    }}
                                >
                                    {s.icon}
                                </UnstyledButton>
                            ))}
                        </Group>
                    </Box>

                    {/* Navigation */}
                    <Box>
                        <Text style={{ fontWeight: 600, fontSize: ".875rem", color: "var(--text-primary)", marginBottom: "1rem", letterSpacing: ".05em", textTransform: "uppercase" }}>
                            Navegación
                        </Text>
                        <Stack gap="xs">
                            {[
                                { href: "/", label: "Inicio" },
                                { href: "/catalogo", label: "Catálogo" },
                                { href: "/ayuda", label: "Ayuda y FAQ" },
                            ].map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    style={{
                                        color: "var(--text-muted)", fontSize: ".875rem",
                                        textDecoration: "none", transition: "var(--transition)",
                                        width: "fit-content",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
                                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </Stack>
                    </Box>

                    {/* Categories */}
                    <Box>
                        <Text style={{ fontWeight: 600, fontSize: ".875rem", color: "var(--text-primary)", marginBottom: "1rem", letterSpacing: ".05em", textTransform: "uppercase" }}>
                            Categorías
                        </Text>
                        <Stack gap="xs">
                            {["Laptops", "Smartphones", "Audio", "Accesorios", "Smart Home"].map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/catalogo?cat=${cat.toLowerCase()}`}
                                    style={{
                                        color: "var(--text-muted)", fontSize: ".875rem",
                                        textDecoration: "none", transition: "var(--transition)",
                                        width: "fit-content",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
                                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
                                >
                                    {cat}
                                </Link>
                            ))}
                        </Stack>
                    </Box>

                    {/* Contact */}
                    <Box>
                        <Text style={{ fontWeight: 600, fontSize: ".875rem", color: "var(--text-primary)", marginBottom: "1rem", letterSpacing: ".05em", textTransform: "uppercase" }}>
                            Contacto
                        </Text>
                        <Stack gap="sm">
                            {[
                                { icon: <MapPin size={14} />, text: branding.contact.address },
                                { icon: <Phone size={14} />, text: branding.contact.phone },
                                { icon: <Mail size={14} />, text: branding.contact.email },
                            ].map((c, i) => (
                                <Group key={i} align="flex-start" gap="xs" wrap="nowrap" style={{ color: "var(--text-muted)", fontSize: ".875rem" }}>
                                    <Box style={{ color: "var(--accent)", marginTop: ".1rem", flexShrink: 0 }}>{c.icon}</Box>
                                    <Text style={{ color: "var(--text-muted)", fontSize: ".875rem" }}>{c.text}</Text>
                                </Group>
                            ))}
                        </Stack>
                    </Box>
                </SimpleGrid>

                {/* Bottom bar */}
                <Divider style={{ borderColor: "var(--border)", marginBottom: "1.25rem" }} />
                <Group justify="space-between" align="center" gap="md" wrap="wrap">
                    <Text style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>
                        © {currentYear} {branding.store_name}. Todos los derechos reservados.
                    </Text>
                    <Group gap="xl">
                        {["Términos y condiciones", "Política de privacidad"].map((t) => (
                            <UnstyledButton
                                component="a"
                                key={t}
                                href="#"
                                style={{ color: "var(--text-muted)", fontSize: ".8rem", textDecoration: "none", transition: "var(--transition)" }}
                                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--accent)"}
                                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
                            >
                                {t}
                            </UnstyledButton>
                        ))}
                    </Group>
                </Group>
            </Box>
        </Box>
    );
}
