"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { promoSlides } from "@/lib/mockData";
import Link from "next/link";

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    const next = useCallback(() => setCurrent((c) => (c + 1) % promoSlides.length), []);
    const prev = () => setCurrent((c) => (c - 1 + promoSlides.length) % promoSlides.length);

    useEffect(() => {
        if (paused) return;
        const id = setInterval(next, 5000);
        return () => clearInterval(id);
    }, [paused, next]);

    const slide = promoSlides[current];

    return (
        <div
            style={{ position: "relative", width: "100%", height: "520px", overflow: "hidden" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {promoSlides.map((s, i) => (
                <div
                    key={s.id}
                    style={{
                        position: "absolute", inset: 0,
                        opacity: i === current ? 1 : 0,
                        transition: "opacity .7s ease",
                        zIndex: i === current ? 1 : 0,
                    }}
                >
                    {/* Background image */}
                    <div
                        style={{
                            position: "absolute", inset: 0,
                            backgroundImage: `url(${s.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "brightness(.35)",
                        }}
                    />
                    {/* Gradient overlay */}
                    <div
                        style={{
                            position: "absolute", inset: 0,
                            background: `linear-gradient(135deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.3) 60%, transparent 100%)`,
                        }}
                    />
                </div>
            ))}

            {/* Content */}
            <div
                style={{
                    position: "relative", zIndex: 2,
                    height: "100%",
                    display: "flex", alignItems: "center",
                    maxWidth: 1280, margin: "0 auto",
                    padding: "0 1.5rem",
                }}
            >
                <div
                    key={current}
                    className="animate-fade-in"
                    style={{ maxWidth: 560 }}
                >
                    <div
                        style={{
                            display: "inline-flex", alignItems: "center", gap: ".5rem",
                            background: "rgba(255,255,255,.12)",
                            backdropFilter: "blur(8px)",
                            border: "1px solid rgba(255,255,255,.2)",
                            borderRadius: 9999, padding: ".35rem 1rem",
                            fontSize: ".8rem", color: "rgba(255,255,255,.9)",
                            marginBottom: "1.25rem", fontWeight: 500,
                        }}
                    >
                        🔥 Oferta especial
                    </div>
                    <h1
                        style={{
                            fontSize: "clamp(2rem, 5vw, 3.25rem)",
                            fontWeight: 800,
                            color: "#fff",
                            lineHeight: 1.15,
                            marginBottom: ".75rem",
                            letterSpacing: "-.03em",
                        }}
                    >
                        {slide.title}
                    </h1>
                    <p
                        style={{
                            fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
                            color: "rgba(255,255,255,.85)",
                            fontWeight: 600,
                            marginBottom: ".75rem",
                        }}
                    >
                        {slide.subtitle}
                    </p>
                    <p style={{ fontSize: ".95rem", color: "rgba(255,255,255,.65)", marginBottom: "2rem" }}>
                        {slide.description}
                    </p>
                    <Link
                        href="/catalogo"
                        className="btn-primary"
                        style={{ fontSize: "1rem", padding: ".85rem 2rem", borderRadius: 12 }}
                    >
                        {slide.cta} →
                    </Link>
                </div>
            </div>

            {/* Navigation arrows */}
            <button
                onClick={prev}
                style={{
                    position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
                    zIndex: 3, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,.25)", borderRadius: "50%",
                    width: 44, height: 44,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff", transition: "var(--transition)",
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.25)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.15)"}
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={next}
                style={{
                    position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
                    zIndex: 3, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,.25)", borderRadius: "50%",
                    width: 44, height: 44,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff", transition: "var(--transition)",
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.25)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.15)"}
            >
                <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div
                style={{
                    position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
                    zIndex: 3, display: "flex", gap: ".5rem",
                }}
            >
                {promoSlides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        style={{
                            width: i === current ? 24 : 8, height: 8,
                            borderRadius: 9999, border: "none", cursor: "pointer",
                            background: i === current ? "#fff" : "rgba(255,255,255,.4)",
                            transition: "all .3s ease",
                            padding: 0,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
