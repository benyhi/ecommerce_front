"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, ShoppingCart, CheckCircle, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import type { ProductReadOnly, SelectedOption } from "@/types";
import { useCart } from "@/contexts/CartContext";

function formatPrice(n: number) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency", currency: "ARS", minimumFractionDigits: 0,
    }).format(n);
}

interface Props {
    product: ProductReadOnly;
    onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
    const [added, setAdded] = useState(false);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on ESC
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const gallery = React.useMemo(() => {
        const base = product.images && product.images.length > 0
            ? product.images
            : product.image_url
                ? [product.image_url]
                : [];
        const colorOption = selectedOptions.find((s) =>
            s.groupName.toLowerCase().includes("color") && s.option.image_url
        );
        if (colorOption?.option.image_url) {
            const img = colorOption.option.image_url;
            return [img, ...base.filter((b) => b !== img)];
        }
        return base;
    }, [product, selectedOptions]);

    useEffect(() => {
        setActiveImage((prev) => {
            if (prev && gallery.includes(prev)) return prev;
            return gallery[0] ?? null;
        });
    }, [gallery]);

    function handleThumbClick(img: string) {
        setActiveImage(img);
    }

    function goNextImage() {
        if (!gallery.length) return;
        const currentIndex = gallery.findIndex((g) => g === activeImage);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % gallery.length;
        setActiveImage(gallery[nextIndex]);
    }

    function goPrevImage() {
        if (!gallery.length) return;
        const currentIndex = gallery.findIndex((g) => g === activeImage);
        const prevIndex = currentIndex <= 0 ? gallery.length - 1 : currentIndex - 1;
        setActiveImage(gallery[prevIndex]);
    }

    const basePrice = parseFloat(product.price);
    const compareBase = product.compare_at_price
        ? parseFloat(product.compare_at_price)
        : product.is_offer
            ? basePrice * 1.1
            : null;
    const extrasPrice = selectedOptions.reduce((acc, s) => acc + parseFloat(s.option.price), 0);
    const unitPrice = basePrice + extrasPrice;
    const compareUnitPrice = compareBase !== null ? compareBase + extrasPrice : null;
    const totalPrice = unitPrice * quantity;
    const discountPercent = compareUnitPrice ? Math.max(0, Math.round((1 - unitPrice / compareUnitPrice) * 100)) : null;

    function toggleOption(groupId: string, groupName: string, optionId: string, maxChoices: number) {
        const opt = optionGroups
            .find((g) => g.id === groupId)?.options
            .find((o) => o.id === optionId);
        if (!opt) return;

        setSelectedOptions((prev) => {
            const alreadySelected = prev.find(
                (s) => s.groupId === groupId && s.option.id === optionId
            );
            if (alreadySelected) {
                return prev.filter((s) => !(s.groupId === groupId && s.option.id === optionId));
            }
            const groupSelections = prev.filter((s) => s.groupId === groupId);
            if (groupSelections.length >= maxChoices) {
                // Remove oldest if single choice
                const withoutFirst = maxChoices === 1
                    ? prev.filter((s) => s.groupId !== groupId)
                    : prev;
                return [...withoutFirst, { groupId, groupName, option: opt }];
            }
            return [...prev, { groupId, groupName, option: opt }];
        });
    }

    function isSelected(groupId: string, optionId: string) {
        return selectedOptions.some((s) => s.groupId === groupId && s.option.id === optionId);
    }

    const optionGroups = product.option_groups ?? [];
    const sortedGroups = [...optionGroups].sort((a, b) => a.order - b.order);

    const colorGroup = sortedGroups.find(
        (g) => g.name.toLowerCase().includes("color") || g.options.some((o) => o.swatch_hex || o.image_url)
    );
    const remainingGroups = colorGroup ? sortedGroups.filter((g) => g.id !== colorGroup.id) : sortedGroups;

    // Check if all required groups have at least one selection
    const requiredMet = sortedGroups
        .filter((g) => g.required)
        .every((g) => selectedOptions.some((s) => s.groupId === g.id));

    function handleAdd() {
        if (!requiredMet) return;
        addItem(product, selectedOptions, quantity);
        setAdded(true);
        // Close the modal shortly after a successful add to avoid auto-opening the cart.
        setTimeout(() => {
            onClose();
        }, 600);
    }

    return (
        <>
            <div
                ref={overlayRef}
                className="overlay"
                onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
                style={{ zIndex: 45 }}
            />
            <div
                className="animate-scale-in"
                style={{
                    position: "fixed", inset: 0, zIndex: 50,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "1rem", pointerEvents: "none",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border)",
                        borderRadius: 20, boxShadow: "var(--shadow-lg)",
                        width: "100%", maxWidth: 980,
                        maxHeight: "90vh",
                        pointerEvents: "all", overflow: "hidden",
                        margin: "auto",
                        display: "flex", flexDirection: "column",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
                        <div>
                            <p style={{ fontSize: ".78rem", color: "var(--text-muted)", marginBottom: ".25rem" }}>{product.category?.name}</p>
                            <h2 style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "1.35rem" }}>{product.name}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border)",
                                borderRadius: "50%", width: 36, height: 36,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", color: "var(--text-secondary)",
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="modal-body-grid" style={{ maxHeight: "calc(90vh - 96px)", overflowY: "auto", overflowX: "hidden", width: "100%", boxSizing: "border-box" }}>
                        <div
                            className="modal-gallery"
                            style={{ "--gallery-columns": gallery.length > 1 ? "88px 1fr" : "1fr" } as React.CSSProperties}
                        >
                            {gallery.length > 1 && (
                                <div className="modal-thumbs">
                                    {gallery.map((img) => {
                                        const active = img === activeImage;
                                        return (
                                            <button
                                                key={img}
                                                onClick={() => handleThumbClick(img)}
                                                style={{
                                                    position: "relative",
                                                    width: "100%",
                                                    padding: 0,
                                                    borderRadius: 10,
                                                    overflow: "hidden",
                                                    border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                                                    cursor: "pointer",
                                                    aspectRatio: "1 / 1",
                                                    background: "var(--bg-card)",
                                                }}
                                            >
                                                <Image src={img} alt="Vista previa" fill sizes="96px" style={{ objectFit: "cover" }} />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="modal-hero" style={{ position: "relative", background: "var(--bg-elevated)", borderRadius: 16, overflow: "hidden", aspectRatio: "4 / 3", border: "1px solid var(--border)", minHeight: 0 }}>
                                {activeImage ? (
                                    <Image src={activeImage} alt={product.name} fill sizes="520px" style={{ objectFit: "cover" }} />
                                ) : (
                                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", background: "linear-gradient(135deg, var(--bg-elevated), var(--border))" }}>
                                        <ShoppingCart size={32} />
                                    </div>
                                )}

                                {gallery.length > 1 && (
                                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
                                        <button
                                            onClick={goPrevImage}
                                            style={{
                                                pointerEvents: "all",
                                                marginLeft: ".5rem",
                                                background: "rgba(0,0,0,.55)",
                                                color: "#fff",
                                                border: "1px solid rgba(255,255,255,.25)",
                                                borderRadius: "50%",
                                                width: 36,
                                                height: 36,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={goNextImage}
                                            style={{
                                                pointerEvents: "all",
                                                marginRight: ".5rem",
                                                background: "rgba(0,0,0,.55)",
                                                color: "#fff",
                                                border: "1px solid rgba(255,255,255,.25)",
                                                borderRadius: "50%",
                                                width: 36,
                                                height: 36,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-info">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap" }}>
                                    <div>
                                        <p style={{ fontSize: ".78rem", color: "var(--text-muted)", marginBottom: ".2rem" }}>Precio</p>
                                        <div style={{ display: "flex", alignItems: "baseline", gap: ".55rem" }}>
                                            <p style={{ fontWeight: 800, fontSize: "1.6rem", color: "var(--text-primary)", lineHeight: 1 }}>
                                                {formatPrice(unitPrice)}
                                            </p>
                                            {compareUnitPrice !== null && (
                                                <span style={{ fontSize: ".9rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                                                    {formatPrice(compareUnitPrice)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {discountPercent !== null && (
                                        <span className="badge" style={{ background: "#0f9d58", color: "#fff", fontWeight: 700 }}>
                                            -{discountPercent}%
                                        </span>
                                    )}
                                    {product.is_offer && (
                                        <span className="badge" style={{ background: "var(--accent)", color: "#fff", display: "inline-flex", alignItems: "center", gap: ".35rem" }}>
                                            <Tag size={14} /> Oferta
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: ".35rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                                    <span style={{ fontSize: ".85rem", color: "var(--text-muted)" }}>Total:</span>
                                    <span style={{ fontSize: "1.15rem", color: "var(--text-primary)" }}>{formatPrice(totalPrice)}</span>
                                </div>
                            </div>

                            <p style={{ color: "var(--text-secondary)", fontSize: ".95rem", lineHeight: 1.7 }}>
                                {product.description}
                            </p>

                            {colorGroup && (
                                <div
                                    className="color-strip"
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: ".5rem",
                                        padding: ".75rem 1rem",
                                        border: "1px solid var(--border)",
                                        borderRadius: 12,
                                        background: "var(--bg-elevated)",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".5rem" }}>
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--text-primary)" }}>
                                                Color / Variedad
                                            </span>
                                            {colorGroup.required && (
                                                <span className="badge badge-danger" style={{ marginLeft: ".5rem", fontSize: ".65rem" }}>
                                                    Requerido
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: ".75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                            {colorGroup.max_choices === 1 ? "Elegí 1" : `Hasta ${colorGroup.max_choices}`}
                                        </span>
                                    </div>
                                    <div className="color-chip-row" style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", overflowX: "hidden", paddingBottom: ".25rem", maxWidth: "100%" }}>
                                        {[...colorGroup.options]
                                            .sort((a, b) => a.order - b.order)
                                            .filter((o) => o.active)
                                            .map((opt) => {
                                                const sel = isSelected(colorGroup.id, opt.id);
                                                const hasSwatch = Boolean(opt.swatch_hex);
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => toggleOption(colorGroup.id, colorGroup.name, opt.id, colorGroup.max_choices)}
                                                        style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: ".45rem",
                                                            padding: ".5rem .75rem",
                                                            borderRadius: 999,
                                                            cursor: "pointer",
                                                            border: `1.5px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                                                            background: sel ? "var(--accent-light)" : "var(--bg-card)",
                                                            color: sel ? "var(--accent)" : "var(--text-secondary)",
                                                            fontSize: ".85rem",
                                                            fontWeight: sel ? 700 : 500,
                                                            whiteSpace: "nowrap",
                                                            boxShadow: sel ? "0 0 0 2px var(--accent-light)" : "none",
                                                        }}
                                                    >
                                                        {hasSwatch && (
                                                            <span
                                                                style={{
                                                                    width: 18,
                                                                    height: 18,
                                                                    borderRadius: "50%",
                                                                    background: opt.swatch_hex ?? "#ccc",
                                                                    border: "1px solid rgba(0,0,0,.12)",
                                                                }}
                                                            />
                                                        )}
                                                        <span>{opt.name}</span>
                                                        {parseFloat(opt.price) > 0 && (
                                                            <span style={{ fontSize: ".75rem", color: sel ? "var(--accent)" : "var(--text-muted)" }}>
                                                                +{formatPrice(parseFloat(opt.price))}
                                                            </span>
                                                        )}
                                                        {sel && <CheckCircle size={14} />}
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                            {remainingGroups.length > 0 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {remainingGroups.map((group) => {
                                        const groupSelected = selectedOptions.filter((s) => s.groupId === group.id);
                                        return (
                                            <div key={group.id}>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".5rem", gap: ".5rem" }}>
                                                    <div>
                                                        <span style={{ fontWeight: 700, fontSize: ".95rem", color: "var(--text-primary)" }}>
                                                            {group.name}
                                                        </span>
                                                        {group.required && (
                                                            <span className="badge badge-danger" style={{ marginLeft: ".5rem", fontSize: ".65rem" }}>
                                                                Requerido
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: ".75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                                        {group.max_choices === 1 ? "Elegí 1" : `Hasta ${group.max_choices}`}
                                                        {" · "}{groupSelected.length} seleccionado{groupSelected.length !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem" }}>
                                                    {[...group.options]
                                                        .sort((a, b) => a.order - b.order)
                                                        .filter((o) => o.active)
                                                        .map((opt) => {
                                                            const sel = isSelected(group.id, opt.id);
                                                            const isColor = group.name.toLowerCase().includes("color") && opt.swatch_hex;
                                                            return (
                                                                <button
                                                                    key={opt.id}
                                                                    onClick={() => toggleOption(group.id, group.name, opt.id, group.max_choices)}
                                                                    style={{
                                                                        display: "inline-flex", alignItems: "center", gap: ".45rem",
                                                                        padding: ".5rem .85rem",
                                                                        borderRadius: 10, cursor: "pointer",
                                                                        background: sel ? "var(--accent-light)" : "var(--bg-elevated)",
                                                                        border: `1.5px solid ${sel ? "var(--accent)" : "var(--border)"}`,
                                                                        color: sel ? "var(--accent)" : "var(--text-secondary)",
                                                                        fontSize: ".85rem", fontWeight: sel ? 700 : 500,
                                                                        transition: "var(--transition)",
                                                                    }}
                                                                >
                                                                    {isColor && (
                                                                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: opt.swatch_hex ?? "#ccc", border: "1px solid rgba(0,0,0,.1)" }} />
                                                                    )}
                                                                    {opt.name}
                                                                    {parseFloat(opt.price) > 0 && (
                                                                        <span style={{ fontSize: ".75rem", color: sel ? "var(--accent)" : "var(--text-muted)" }}>
                                                                            +{formatPrice(parseFloat(opt.price))}
                                                                        </span>
                                                                    )}
                                                                    {sel && <CheckCircle size={14} />}
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div
                                style={{
                                    background: "var(--bg-elevated)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 14, padding: "1rem 1.25rem",
                                    display: "flex", flexWrap: "wrap",
                                    alignItems: "center", justifyContent: "space-between",
                                    gap: "1rem",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                                        <button
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: "var(--text-secondary)" }}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span style={{ padding: "0 .75rem", fontWeight: 700, color: "var(--text-primary)", minWidth: 30, textAlign: "center" }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity((q) => q + 1)}
                                            style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", cursor: "pointer", color: "var(--text-secondary)" }}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAdd}
                                    disabled={!requiredMet || added}
                                    className="btn-primary"
                                    style={{
                                        padding: ".75rem 1.5rem",
                                        opacity: !requiredMet ? .5 : 1,
                                        background: added ? "var(--success)" : undefined,
                                    }}
                                >
                                    {added ? (
                                        <><CheckCircle size={16} /> ¡Agregado!</>
                                    ) : (
                                        <><ShoppingCart size={16} /> Agregar al carrito</>
                                    )}
                                </button>
                            </div>

                            {!requiredMet && (
                                <p style={{ fontSize: ".8rem", color: "var(--danger)", marginTop: "-.25rem" }}>
                                    Por favor, completá las opciones requeridas para continuar.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                .modal-body-grid { display: grid; grid-template-columns: minmax(320px, 1.1fr) 1fr; gap: 1.5rem; padding: 1.25rem; align-items: start; }
                .modal-gallery { display: grid; grid-template-columns: var(--gallery-columns, 1fr); gap: 1rem; align-items: start; }
                .modal-thumbs { display: flex; flex-direction: column; gap: 0.5rem; }
                .modal-info { display: flex; flex-direction: column; gap: 1rem; }
                .color-chip-row::-webkit-scrollbar { height: 6px; }
                .color-chip-row::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }

                @media (max-width: 1024px) {
                    .modal-body-grid { grid-template-columns: 1fr; }
                    .modal-gallery { grid-template-columns: 1fr; }
                    .modal-thumbs { flex-direction: row; overflow-x: auto; padding-bottom: 0.25rem; }
                    .modal-thumbs button { min-width: 76px; max-width: 120px; }
                    .modal-hero { aspect-ratio: 4 / 3; }
                }
                @media (max-width: 640px) {
                    .modal-body-grid { padding: 1rem; gap: 1rem; }
                    .modal-info { gap: 0.75rem; }
                }
            `}</style>
        </>
    );
}
