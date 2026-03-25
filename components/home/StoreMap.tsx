"use client";

import React from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { useBranding } from "@/contexts/BrandContext";

export default function StoreMap() {
    const { branding } = useBranding();
    const contactItems = [
        {
            icon: <MapPin size={20} />,
            label: "Dirección",
            value: branding.contact.address,
            sub: "Sucursal principal",
            color: "#6366f1",
        },
        {
            icon: <Phone size={20} />,
            label: "Teléfono",
            value: branding.contact.phone,
            sub: "Lun–Vie 9–18hs",
            color: "#22d3ee",
        },
        {
            icon: <Mail size={20} />,
            label: "Email",
            value: branding.contact.email,
            sub: "Respondemos en 24hs",
            color: "#10b981",
        },
        {
            icon: <MessageCircle size={20} />,
            label: "WhatsApp",
            value: branding.contact.whatsapp,
            sub: "Chat rápido",
            color: "#25d366",
        },
        {
            icon: <Clock size={20} />,
            label: "Horarios",
            value: branding.contact.business_hours,
            sub: "Atención comercial",
            color: "#f59e0b",
        },
    ];

    return (
        <section style={{ padding: "5rem 0", background: "var(--bg-secondary)" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", marginBottom: ".5rem" }}>
                        <MapPin size={18} style={{ color: "var(--accent)" }} />
                        <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                            Dónde estamos
                        </span>
                    </div>
                    <h2 className="section-title" style={{ textAlign: "center", marginBottom: ".5rem" }}>Visitanos en el local</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: ".95rem" }}>
                        Atención personalizada y asesoramiento técnico en persona
                    </p>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "2rem",
                        alignItems: "start",
                    }}
                    className="map-grid"
                >
                    {/* Map */}
                    <div
                        style={{
                            borderRadius: 20, overflow: "hidden",
                            border: "1px solid var(--border)",
                            boxShadow: "var(--shadow-md)",
                            aspectRatio: "4/3",
                        }}
                    >
                        <iframe
                            src={branding.contact.map_embed_url}
                            width="100%"
                            height="100%"
                            style={{ border: 0, display: "block" }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={branding.contact.map_title}
                        />
                    </div>

                    {/* Contact info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {contactItems.map((item, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex", alignItems: "center", gap: "1rem",
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 14, padding: "1.1rem 1.25rem",
                                    transition: "var(--transition)",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
                                    (e.currentTarget as HTMLElement).style.transform = "translateX(4px)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                    (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                                }}
                            >
                                <div
                                    style={{
                                        width: 44, height: 44, flexShrink: 0,
                                        background: `${item.color}18`,
                                        border: `1px solid ${item.color}30`,
                                        borderRadius: 12,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: item.color,
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <div>
                                    <p style={{ fontSize: ".75rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em" }}>
                                        {item.label}
                                    </p>
                                    <p style={{ fontSize: ".95rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                        {item.value}
                                    </p>
                                    {item.sub && (
                                        <p style={{ fontSize: ".78rem", color: "var(--text-muted)" }}>{item.sub}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .map-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </section>
    );
}
