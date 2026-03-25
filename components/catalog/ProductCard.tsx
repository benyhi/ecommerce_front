"use client";

import React from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import { featuredProductIds } from "@/lib/mockData";
import type { Product } from "@/types";

function formatPrice(p: string) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency", currency: "ARS", minimumFractionDigits: 0,
    }).format(parseFloat(p));
}

interface Props {
    product: Product;
    onClick: () => void;
    badge?: string;
}

export default function ProductCard({ product, onClick, badge }: Props) {
    const price = parseFloat(product.price);
    const comparePrice = product.compare_at_price
        ? parseFloat(product.compare_at_price)
        : product.is_offer
            ? price * 1.1
            : null;
    const hasDiscount = comparePrice !== null && comparePrice > price;
    const discountPercent = hasDiscount ? Math.max(0, Math.round((1 - price / comparePrice) * 100)) : null;
    const isFeatured = featuredProductIds.includes(product.id);
    const featuredTop = "0.6rem";
    const discountTop = isFeatured ? "2.6rem" : "0.6rem";

    return (
        <div
            className="card product-card"
            style={{ display: "flex", flexDirection: "column", overflow: "hidden", cursor: "pointer" }}
            onClick={onClick}
        >
            {/* Image */}
            <div
                style={{
                    position: "relative", aspectRatio: "16/10",
                    overflow: "hidden", background: "var(--bg-elevated)",
                }}
            >
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                        style={{ objectFit: "cover", transition: "transform .4s ease" }}
                    />
                ) : (
                    <div
                        style={{
                            inset: 0, position: "absolute",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "linear-gradient(135deg, var(--bg-elevated), var(--border))",
                        }}
                    >
                        <ShoppingCart size={32} style={{ color: "var(--text-muted)" }} />
                    </div>
                )}

                {badge && (
                    <span
                        className="badge badge-accent"
                        style={{ position: "absolute", top: ".6rem", left: ".6rem" }}
                    >
                        {badge}
                    </span>
                )}

                {isFeatured && (
                    <span
                        className="badge"
                        style={{ position: "absolute", top: featuredTop, right: ".6rem", background: "var(--accent)", color: "#fff", fontWeight: 700 }}
                    >
                        Destacado
                    </span>
                )}

                {hasDiscount && discountPercent !== null && (
                    <span
                        className="badge"
                        style={{ position: "absolute", top: discountTop, right: ".6rem", background: "#0f9d58", color: "#fff", fontWeight: 700 }}
                    >
                        -{discountPercent}%
                    </span>
                )}

                {/* Hover overlay */}
                <div
                    style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: 0,
                        transition: "opacity .2s",
                    }}
                    className="product-card-overlay"
                >
                    <div style={{ display: "flex", alignItems: "center", gap: ".5rem", color: "#fff", fontWeight: 600, fontSize: ".9rem" }}>
                        <Eye size={16} />
                        Ver detalle
                    </div>
                </div>

                <style>{`
          .card:hover .product-card-overlay { opacity: 1 !important; }
          .card:hover img { transform: scale(1.05); }
                    @media (max-width: 640px) {
                        .product-card { height: 100%; }
                        .product-card h3 { font-size: 0.82rem; }
                    }
        `}</style>
            </div>

            {/* Info */}
            <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3
                    style={{
                        fontWeight: 600, fontSize: ".875rem",
                        color: "var(--text-primary)", marginBottom: ".35rem",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {product.name}
                </h3>
                <p
                    style={{
                        fontSize: ".78rem", color: "var(--text-muted)",
                        lineHeight: 1.5, flex: 1, marginBottom: ".75rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {product.description}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: ".2rem" }}>
                        {hasDiscount && comparePrice !== null && (
                            <span style={{ fontSize: ".78rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                                {formatPrice(comparePrice.toString())}
                            </span>
                        )}
                        <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)" }}>
                            {formatPrice(product.price)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
