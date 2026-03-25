"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { TextInput, ActionIcon } from "@mantine/core";

interface Props {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Buscar productos..." }: Props) {
    return (
        <TextInput
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            leftSection={<Search size={16} />}
            rightSection={
                value ? (
                    <ActionIcon 
                        variant="subtle" 
                        onClick={() => onChange("")} 
                        size="sm"
                    >
                        <X size={14} />
                    </ActionIcon>
                ) : null
            }
            style={{ maxWidth: 420 }}
        />
    );
}
