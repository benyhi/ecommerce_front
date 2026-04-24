"use client";

import React from "react";
import { Pill, Group } from "@mantine/core";
import type { Category } from "@/types";

interface Props {
    categories: Category[];
    activeId: string | null;
    onSelect: (id: string | null) => void;
}

export default function CategoryTabs({ categories, activeId, onSelect }: Props) {
    return (
        <Group gap="xs" style={{ overflowX: "auto", flexWrap: "nowrap" }}>
            <Pill 
                size="md"
                withRemoveButton={false}
                bg={activeId === null ? "var(--accent)" : "var(--bg-elevated)"}
                c={activeId === null ? "white" : "var(--text-secondary)"}
                style={{ 
                    cursor: "pointer",
                    fontWeight: activeId === null ? 600 : 500,
                }}
                onClick={() => onSelect(null)}
            >
                Todos
            </Pill>
            {[...categories]
                .sort((a, b) => a.order - b.order)
                .map((cat) => (
                    <Pill
                        key={cat.id}
                        size="md"
                        withRemoveButton={false}
                        bg={activeId === cat.id ? "var(--accent)" : "var(--bg-elevated)"}
                        c={activeId === cat.id ? "white" : "var(--text-secondary)"}
                        style={{ 
                            cursor: "pointer",
                            fontWeight: activeId === cat.id ? 600 : 500,
                        }}
                        onClick={() => onSelect(cat.id)}
                    >
                        {cat.name}
                    </Pill>
                ))}
        </Group>
    );
}
