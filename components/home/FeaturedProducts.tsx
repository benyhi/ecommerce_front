"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, TrendingUp, Tag } from "lucide-react";
import { mockCategories, featuredProductIds } from "@/lib/mockData";
import type { Product } from "@/types";

function formatPrice(p: string) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency", currency: "ARS", minimumFractionDigits: 0,
    }).format(parseFloat(p));
}

const badges = [
    { ids: [1, 3], label: "🔥 Más vendido", cls: "badge-danger" },
    { ids: [4, 7], label: "⭐ Destacado", cls: "badge-accent" },
    { ids: [9, 12], label: "💸 Oferta", cls: "badge-success" },
];

function getBadge(id: number) {
    for (const b of badges) {
        if (b.ids.includes(id)) return b;
    }
    return null;
}

export default function FeaturedProducts() {
    const router = useRouter();

    const featured: Product[] = [];
    for (const cat of mockCategories) {
        for (const p of cat.products) {
            if (featuredProductIds.includes(p.id)) featured.push(p);
        }
    }

    return (
        <section style={{ padding: "5rem 0", background: "var(--bg-primary)" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
                {/* Header */}
                <div
                    style={{
                        display: "flex", flexWrap: "wrap",
                        alignItems: "flex-end", justifyContent: "space-between",
                        gap: "1rem", marginBottom: "2.5rem",
                    }}
                >
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: ".5rem" }}>
                            <TrendingUp size={18} style={{ color: "var(--accent)" }} />
                            <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                                Lo más destacado
                            </span>
                        </div>
                        <h2 className="section-title">Productos destacados</h2>
                        <p style={{ color: "var(--text-muted)", marginTop: ".5rem", fontSize: ".95rem" }}>
                            Los favoritos de nuestros clientes, seleccionados para vos
                        </p>
                    </div>
                    <Link
                        href="/catalogo"
                        className="btn-ghost"
                        style={{ display: "flex", alignItems: "center", gap: ".4rem" }}
                    >
                        Ver catálogo completo <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                        gap: "1.25rem",
                    }}
                >
                    {featured.map((product) => {
                        const badge = getBadge(product.id);
                        return (
                            <ProductCard
                                key={product.id}
                                product={product}
                                badge={badge}
                                onOpen={() => router.push(`/catalogo/${product.id}`)}
                            />
                        );
                    })}
                </div>

                {/* CTA banner */}
                <div
                    style={{
                        marginTop: "3rem",
                        background: "linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)",
                        borderRadius: 20, padding: "2.5rem",
                        display: "flex", flexWrap: "wrap",
                        alignItems: "center", justifyContent: "space-between",
                        gap: "1.5rem",
                    }}
                >
                    <div>
                        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.4rem", marginBottom: ".4rem" }}>
                            ¿Buscás algo específico?
                        </h3>
                        <p style={{ color: "rgba(255,255,255,.8)", fontSize: ".95rem" }}>
                            Explorá nuestro catálogo completo con filtros y búsqueda avanzada
                        </p>
                    </div>
                    <Link
                        href="/catalogo"
                        style={{
                            display: "inline-flex", alignItems: "center", gap: ".5rem",
                            background: "#fff", color: "var(--accent)",
                            fontWeight: 700, fontSize: ".95rem",
                            padding: ".85rem 1.75rem", borderRadius: 12,
                            textDecoration: "none", transition: "var(--transition)",
                            whiteSpace: "nowrap", flexShrink: 0,
                        }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
                        onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
                    >
                        <Tag size={16} /> Ver todo el catálogo
                    </Link>
                </div>
            </div>
        </section>
    );
}

function ProductCard({
    product, badge, onOpen,
}: {
    product: Product;
    badge: { label: string; cls: string } | null;
    onOpen: () => void;
}) {
    return (
        <div
            className="card"
            style={{
                display: "flex", flexDirection: "column", overflow: "hidden",
                cursor: "pointer",
            }}
            onClick={onOpen}
        >
            {/* Image */}
            <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden", background: "var(--bg-elevated)" }}>
                {product.image_url && (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        style={{ objectFit: "cover", transition: "transform .4s ease" }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.transform = "scale(1.07)"}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.transform = "scale(1)"}
                    />
                )}
                {badge && (
                    <span
                        className={`badge ${badge.cls}`}
                        style={{ position: "absolute", top: ".65rem", left: ".65rem" }}
                    >
                        {badge.label}
                    </span>
                )}
            </div>

            {/* Info */}
            <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontWeight: 600, fontSize: ".9rem", color: "var(--text-primary)", marginBottom: ".4rem", lineHeight: 1.4 }}>
                    {product.name}
                </h3>
                <p style={{ fontSize: ".8rem", color: "var(--text-secondary)", lineHeight: 1.5, flex: 1, marginBottom: ".75rem" }}>
                    {product.description.length > 70 ? product.description.slice(0, 70) + "…" : product.description}
                </p>

                <div>
                    <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text-primary)" }}>
                        {formatPrice(product.price)}
                    </span>
                </div>

            </div>
        </div>
    );
}
