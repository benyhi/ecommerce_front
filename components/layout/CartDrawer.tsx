"use client";

import React from "react";
import { X, Minus, Plus, ShoppingCart, Trash2, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";

function formatPrice(n: number) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
    }).format(n);
}

export default function CartDrawer() {
    const { items, total, isOpen, closeCart, removeItem, updateQuantity, clearCart } = useCart();

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="overlay"
                    onClick={closeCart}
                    style={{ zIndex: 45 }}
                />
            )}

            {/* Drawer */}
            <div
                style={{
                    position: "fixed", top: 0, right: 0,
                    height: "100dvh", width: "100%", maxWidth: 420,
                    background: "var(--bg-secondary)",
                    borderLeft: "1px solid var(--border)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 50,
                    display: "flex", flexDirection: "column",
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                    transition: "transform .3s cubic-bezier(.4,0,.2,1)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "1.25rem 1.5rem",
                        borderBottom: "1px solid var(--border)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                        <ShoppingCart size={20} style={{ color: "var(--accent)" }} />
                        <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                            Mi carrito
                        </h2>
                        {items.length > 0 && (
                            <span className="badge badge-accent">{items.length}</span>
                        )}
                    </div>
                    <div style={{ display: "flex", gap: ".5rem" }}>
                        {items.length > 0 && (
                            <button
                                onClick={clearCart}
                                title="Vaciar carrito"
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    width: 32, height: 32,
                                    background: "transparent", border: "1px solid var(--border)",
                                    borderRadius: 8, cursor: "pointer",
                                    color: "var(--danger)", transition: "var(--transition)",
                                }}
                                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,.08)"}
                                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                        <button
                            onClick={closeCart}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                width: 32, height: 32,
                                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                                borderRadius: 8, cursor: "pointer", color: "var(--text-secondary)",
                                transition: "var(--transition)",
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Items */}
                <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
                    {items.length === 0 ? (
                        <div
                            style={{
                                display: "flex", flexDirection: "column", alignItems: "center",
                                justifyContent: "center", height: "100%",
                                color: "var(--text-muted)", gap: "1rem",
                            }}
                        >
                            <ShoppingCart size={48} strokeWidth={1} />
                            <div style={{ textAlign: "center" }}>
                                <p style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: ".25rem" }}>
                                    Tu carrito está vacío
                                </p>
                                <p style={{ fontSize: ".875rem" }}>
                                    Agregá productos desde el catálogo
                                </p>
                            </div>
                            <button className="btn-primary" onClick={closeCart}
                                style={{ marginTop: ".5rem" }}
                            >
                                Ver catálogo
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                            {items.map((item) => (
                                <div
                                    key={item.cartItemId}
                                    className="animate-fade-in"
                                    style={{
                                        background: "var(--bg-card)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 12,
                                        padding: "1rem",
                                        display: "flex", gap: ".875rem",
                                    }}
                                >
                                    {/* Image */}
                                    <div
                                        style={{
                                            width: 60, height: 60, flexShrink: 0,
                                            borderRadius: 8, overflow: "hidden",
                                            background: "var(--bg-elevated)",
                                            border: "1px solid var(--border)",
                                        }}
                                    >
                                        {item.product.image_url ? (
                                            <Image
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                width={60} height={60}
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <ShoppingCart size={20} style={{ color: "var(--text-muted)" }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: ".875rem", color: "var(--text-primary)", marginBottom: ".2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {item.product.name}
                                        </p>

                                        {/* Selected options */}
                                        {item.selectedOptions.length > 0 && (
                                            <div style={{ marginBottom: ".5rem" }}>
                                                {item.selectedOptions.map((so) => (
                                                    <span
                                                        key={`${so.groupId}-${so.option.id}`}
                                                        style={{
                                                            display: "inline-block",
                                                            fontSize: ".7rem", color: "var(--text-muted)",
                                                            background: "var(--bg-elevated)",
                                                            border: "1px solid var(--border)",
                                                            borderRadius: 4, padding: ".1rem .4rem",
                                                            marginRight: ".25rem", marginBottom: ".2rem",
                                                        }}
                                                    >
                                                        {so.option.name}
                                                        {parseFloat(so.option.price) > 0 && ` +${formatPrice(parseFloat(so.option.price))}`}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".5rem" }}>
                                            {/* Quantity controls */}
                                            <div
                                                style={{
                                                    display: "flex", alignItems: "center",
                                                    background: "var(--bg-elevated)", borderRadius: 8,
                                                    border: "1px solid var(--border)", overflow: "hidden",
                                                }}
                                            >
                                                <button
                                                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                    style={{
                                                        width: 28, height: 28, border: "none", background: "transparent",
                                                        cursor: "pointer", color: "var(--text-secondary)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        transition: "var(--transition)",
                                                    }}
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span style={{ padding: "0 .5rem", fontSize: ".8rem", fontWeight: 600, color: "var(--text-primary)", minWidth: 24, textAlign: "center" }}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                    style={{
                                                        width: 28, height: 28, border: "none", background: "transparent",
                                                        cursor: "pointer", color: "var(--text-secondary)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        transition: "var(--transition)",
                                                    }}
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
                                                <span style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--accent)" }}>
                                                    {formatPrice(item.unitPrice * item.quantity)}
                                                </span>
                                                <button
                                                    onClick={() => removeItem(item.cartItemId)}
                                                    style={{
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        width: 24, height: 24, background: "transparent", border: "none",
                                                        cursor: "pointer", color: "var(--text-muted)", borderRadius: 4,
                                                        transition: "var(--transition)",
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--danger)"}
                                                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div
                        style={{
                            padding: "1.25rem 1.5rem",
                            borderTop: "1px solid var(--border)",
                            background: "var(--bg-card)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Total</span>
                            <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                                {formatPrice(total)}
                            </span>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ width: "100%", justifyContent: "center", padding: ".8rem" }}
                        >
                            <CreditCard size={16} />
                            Proceder al pago
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
