"use client";

import React from "react";
import FAQAccordion from "@/components/help/FAQAccordion";
import ContactForm from "@/components/help/ContactForm";
import {
    MapPin, Mail, Clock, MessageCircle,
    HelpCircle, PhoneCall,
} from "lucide-react";
import { useBranding } from "@/contexts/BrandContext";

export default function AyudaPage() {
    const { branding } = useBranding();
    const quickContacts = [
        {
            icon: <PhoneCall size={22} />,
            label: "Llamanos",
            value: branding.contact.phone,
            sub: branding.contact.business_hours,
            color: "#6366f1",
            href: `tel:${branding.contact.phone.replace(/\s+/g, "")}`,
        },
        {
            icon: <MessageCircle size={22} />,
            label: "WhatsApp",
            value: branding.contact.whatsapp,
            sub: "Respuesta en minutos",
            color: "#25d366",
            href: `https://wa.me/${branding.contact.whatsapp.replace(/\D/g, "")}`,
        },
        {
            icon: <Mail size={22} />,
            label: "Email",
            value: branding.contact.email,
            sub: "Respondemos en 24hs",
            color: "#22d3ee",
            href: `mailto:${branding.contact.email}`,
        },
        {
            icon: <MapPin size={22} />,
            label: "Dirección",
            value: branding.contact.address,
            sub: "Nuestra sucursal principal",
            color: "#f59e0b",
            href: "https://maps.google.com",
        },
    ];

    return (
        <div style={{ background: "var(--bg-primary)", minHeight: "80vh" }}>
            {/* Hero */}
            <div
                style={{
                    background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-elevated) 100%)",
                    borderBottom: "1px solid var(--border)",
                    padding: "3rem 0",
                    textAlign: "center",
                }}
            >
                <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 1.5rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", marginBottom: ".75rem" }}>
                        <HelpCircle size={18} style={{ color: "var(--accent)" }} />
                        <span style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".08em" }}>
                            Centro de ayuda
                        </span>
                    </div>
                    <h1 className="section-title" style={{ textAlign: "center", marginBottom: ".75rem" }}>
                        ¿En qué podemos ayudarte?
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: ".95rem" }}>
                        Encontrá respuestas a las preguntas más frecuentes o contactanos directamente.
                    </p>
                </div>
            </div>

            {/* Quick contact cards */}
            <div
                style={{
                    maxWidth: 1280, margin: "0 auto", padding: "2.5rem 1.5rem",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                        marginBottom: "3.5rem",
                    }}
                >
                    {quickContacts.map((c, i) => (
                        <a
                            key={i}
                            href={c.href}
                            target={c.href.startsWith("http") ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            style={{
                                display: "flex", alignItems: "center", gap: "1rem",
                                background: "var(--bg-card)",
                                border: "1px solid var(--border)",
                                borderRadius: 14, padding: "1.25rem",
                                textDecoration: "none",
                                transition: "var(--transition)",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
                                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                                (e.currentTarget as HTMLElement).style.borderColor = c.color;
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                            }}
                        >
                            <div
                                style={{
                                    width: 46, height: 46, flexShrink: 0,
                                    background: `${c.color}18`,
                                    border: `1px solid ${c.color}30`,
                                    borderRadius: 12,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: c.color,
                                }}
                            >
                                {c.icon}
                            </div>
                            <div>
                                <p style={{ fontSize: ".75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                                    {c.label}
                                </p>
                                <p style={{ fontSize: ".875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                    {c.value}
                                </p>
                                <p style={{ fontSize: ".75rem", color: "var(--text-muted)" }}>{c.sub}</p>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Main content: FAQ + Form + Map */}
                <div
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", alignItems: "start" }}
                    className="help-grid"
                >
                    {/* FAQ */}
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--text-primary)" }}>
                                Preguntas frecuentes
                            </h2>
                        </div>
                        <FAQAccordion />
                    </div>

                    {/* Form + Map */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                        <ContactForm />

                        {/* Mini map */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: "1rem" }}>
                                <MapPin size={18} style={{ color: "var(--accent)" }} />
                                <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                                    Nuestra ubicación
                                </h2>
                            </div>
                            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", aspectRatio: "4/3" }}>
                                <iframe
                                    src={branding.contact.map_embed_url}
                                    width="100%" height="100%"
                                    style={{ border: 0, display: "block" }}
                                    allowFullScreen loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title={`${branding.contact.map_title} - Ayuda`}
                                />
                            </div>
                            <div
                                style={{
                                    marginTop: ".75rem", padding: ".875rem 1rem",
                                    background: "var(--bg-card)", border: "1px solid var(--border)",
                                    borderRadius: 10, display: "flex", alignItems: "center", gap: ".75rem",
                                }}
                            >
                                <Clock size={16} style={{ color: "var(--accent)", flexShrink: 0 }} />
                                <div style={{ fontSize: ".825rem" }}>
                                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Horarios de atención: </span>
                                    <span style={{ color: "var(--text-muted)" }}>{branding.contact.business_hours}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .help-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
}
