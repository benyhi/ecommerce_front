"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Newspaper } from "lucide-react";
import type { Post } from "@/types";

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "";
    return new Intl.DateTimeFormat("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(dateStr));
}

type PostsSectionProps = {
    posts: Post[];
};

export default function PostsSection({ posts }: PostsSectionProps) {
    if (posts.length === 0) return null;

    const [featured, ...rest] = posts;

    return (
        <section style={{ padding: "5rem 0", background: "var(--bg-secondary)" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        gap: "1rem",
                        marginBottom: "2.5rem",
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".5rem",
                                marginBottom: ".5rem",
                            }}
                        >
                            <Newspaper size={18} style={{ color: "var(--accent)" }} />
                            <span
                                style={{
                                    fontSize: ".8rem",
                                    fontWeight: 600,
                                    color: "var(--accent)",
                                    textTransform: "uppercase",
                                    letterSpacing: ".08em",
                                }}
                            >
                                Novedades
                            </span>
                        </div>
                        <h2 className="section-title">Últimas publicaciones</h2>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                marginTop: ".5rem",
                                fontSize: ".95rem",
                            }}
                        >
                            Noticias, promociones y novedades de la tienda
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: rest.length > 0 ? "1fr 1fr" : "1fr",
                        gap: "1.5rem",
                    }}
                    className="posts-grid"
                >
                    {/* Featured post */}
                    <PostCard post={featured} large />

                    {/* Remaining posts */}
                    {rest.length > 0 && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem",
                            }}
                        >
                            {rest.slice(0, 3).map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .posts-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
}

function PostCard({ post, large = false }: { post: Post; large?: boolean }) {
    return (
        <div
            className="card"
            style={{
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: large ? "100%" : "auto",
            }}
        >
            {post.image_url && (
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: large ? "16/9" : "3/1",
                        overflow: "hidden",
                        background: "var(--bg-elevated)",
                        flexShrink: 0,
                    }}
                >
                    <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        style={{ objectFit: "cover", transition: "transform .4s ease" }}
                        onMouseEnter={(e) =>
                            ((e.target as HTMLElement).style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                            ((e.target as HTMLElement).style.transform = "scale(1)")
                        }
                    />
                </div>
            )}

            <div
                style={{
                    padding: large ? "1.5rem" : "1rem",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: ".5rem",
                }}
            >
                {post.published_at && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".35rem",
                            color: "var(--text-muted)",
                            fontSize: ".78rem",
                        }}
                    >
                        <Calendar size={13} />
                        <span>{formatDate(post.published_at)}</span>
                    </div>
                )}

                <h3
                    style={{
                        fontWeight: 700,
                        fontSize: large ? "1.2rem" : ".95rem",
                        color: "var(--text-primary)",
                        lineHeight: 1.35,
                    }}
                >
                    {post.title}
                </h3>

                {post.excerpt && (
                    <p
                        style={{
                            fontSize: ".875rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.6,
                            flex: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: large ? 4 : 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {post.excerpt}
                    </p>
                )}

                <Link
                    href={`/publicaciones/${post.slug || post.id}`}
                    className="btn-ghost"
                    style={{
                        alignSelf: "flex-start",
                        display: "flex",
                        alignItems: "center",
                        gap: ".35rem",
                        fontSize: ".85rem",
                        marginTop: ".25rem",
                    }}
                >
                    Leer más <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    );
}
