"use client";

import {
    Badge,
    Button,
    Checkbox,
    Divider,
    Group,
    NumberInput,
    Paper,
    Radio,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { Trash,  ListCheck} from 'lucide-react';
import type { Category } from "@/types";

export type SortOption = "relevance" | "price_asc" | "price_desc";

interface Props {
    priceMin: number;
    priceMax: number;
    valueMin: number | null;
    valueMax: number | null;
    onPriceMinChange: (v: number | null) => void;
    onPriceMaxChange: (v: number | null) => void;
    brands: string[];
    selectedBrands: Set<string>;
    onToggleBrand: (brand: string) => void;
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
    onlyOffers: boolean;
    onToggleOffers: () => void;
    categories: Category[];
    activeCategoryId: number | null;
    onSelectCategory: (id: number | null) => void;
    appliedCount: number;
    onReset: () => void;
    isMobile?: boolean;
    onClose?: () => void;
}

export default function AdvancedFilters(props: Props) {
    const {
        priceMin, priceMax, valueMin, valueMax,
        onPriceMinChange, onPriceMaxChange,
        brands, selectedBrands, onToggleBrand,
        sortBy, onSortChange, onlyOffers, onToggleOffers,
        categories, activeCategoryId, onSelectCategory,
        appliedCount, onReset, isMobile = false, onClose,
    } = props;

    function handleNumberChange(value: string, setter: (v: number | null) => void) {
        const numeric = value.trim() === "" ? null : Number(value);
        setter(Number.isFinite(numeric) ? numeric : null);
    }

    return (
        <>
            <Paper
                className="advanced-filters"
                radius={isMobile ? "lg" : "lg"}
                withBorder={!isMobile}
                shadow={isMobile ? "none" : "xs"}
                p={isMobile ? "md" : "md"}
                pt={isMobile ? "sm" : "md"}
                style={{
                    position: isMobile ? "static" : "sticky",
                    top: isMobile ? undefined : "5.5rem",
                    width: "100%",
                    flex: 1,
                    maxHeight: isMobile ? "100%" : "calc(100vh - 6rem)",
                    overflowY: "scroll",
                    background: "var(--bg-elevated)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                }}
            >
                <Stack gap="md">
                <Group justify="space-between" align="center">
                    <Button variant="outline" size="xs" onClick={onReset}>Limpiar</Button> 
                    {isMobile && (
                        <Button
                            variant="outline"
                            size="xs"
                            onClick={onClose}
                            style={{ justifyContent: "flex-start" }}
                        >
                            Salir
                        </Button>
                    )}
                </Group>
                <Group justify="space-between" align="end">
                    <Stack gap={2}>
                        <Text size="xs" c="dimmed">Filtros</Text>
                        <Group gap={6}>
                            <Title order={4}>Afiná tu búsqueda</Title>
                            <Badge size="sm" color="gray" variant="light">{appliedCount}</Badge>
                        </Group>
                    </Stack>
                </Group>

                <Stack gap={6}>
                    <Text fw={600}>Ordenar</Text>
                    <Radio.Group value={sortBy} onChange={(val) => onSortChange(val as SortOption)}>
                        <Stack gap={6}>
                            <Radio value="relevance" label="Más relevantes" />
                            <Radio value="price_desc" label="Precio: mayor a menor" />
                            <Radio value="price_asc" label="Precio: menor a mayor" />
                        </Stack>
                    </Radio.Group>
                </Stack>

                <Checkbox
                    label="Solo ofertas"
                    checked={onlyOffers}
                    onChange={() => onToggleOffers()}
                />

                <Stack gap="xs">
                    <Group justify="space-between" align="center">
                        <Text fw={600}>Precio</Text>
                        <Text size="xs" c="dimmed">${priceMin.toLocaleString()} - ${priceMax.toLocaleString()}</Text>
                    </Group>
                    <Group gap="sm" grow wrap="wrap">
                        <NumberInput
                            label="Mínimo"
                            min={priceMin}
                            max={valueMax ?? priceMax}
                            value={valueMin ?? undefined}
                            onChange={(val) => onPriceMinChange(typeof val === "number" ? val : null)}
                            thousandSeparator="."
                            decimalSeparator="," 
                        />
                        <NumberInput
                            label="Máximo"
                            min={valueMin ?? priceMin}
                            max={priceMax}
                            value={valueMax ?? undefined}
                            onChange={(val) => onPriceMaxChange(typeof val === "number" ? val : null)}
                            thousandSeparator="."
                            decimalSeparator="," 
                        />
                    </Group>
                </Stack>

                {categories.length > 0 && (
                    <Stack gap="xs">
                        <Group justify="space-between" align="center">
                            <Text fw={600}>Categorías</Text>
                            <Badge size="sm" variant="light" color="gray">{categories.length}</Badge>
                        </Group>
                        <Radio.Group value={activeCategoryId === null ? "all" : String(activeCategoryId)} onChange={(val) => onSelectCategory(val === "all" ? null : Number(val))}>
                            <Stack gap={6}>
                                <Radio value="all" label="Todas" />
                                {categories.map((cat) => (
                                    <Radio key={cat.id} value={String(cat.id)} label={cat.name} />
                                ))}
                            </Stack>
                        </Radio.Group>
                    </Stack>
                )}

                {brands.length > 0 && (
                    <Stack gap="xs">
                        <Group justify="space-between" align="center">
                            <Text fw={600}>Marca</Text>
                            <Badge size="sm" variant="light" color="gray">{brands.length} opciones</Badge>
                        </Group>
                        <Stack gap={6}>
                            {brands.map((brand) => (
                                <Checkbox
                                    key={brand}
                                    label={brand}
                                    checked={selectedBrands.has(brand)}
                                    onChange={() => onToggleBrand(brand)}
                                />
                            ))}
                        </Stack>
                    </Stack>
                )}
                </Stack>
            </Paper>
            <style>{`
                [data-mantine-color-scheme="dark"] .advanced-filters {
                    background: var(--bg-elevated);
                    border-color: var(--border);
                    color: var(--text-primary);
                }
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-TextInput-input,
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-NumberInput-input,
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-Textarea-input,
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-Select-input {
                    background: var(--bg-card);
                    border-color: var(--border);
                    color: var(--text-primary);
                }
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-Checkbox-input,
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-Radio-radio {
                    border-color: var(--border);
                    background: var(--bg-card);
                }
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-Checkbox-label,
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-Radio-label,
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-Text-root {
                    color: var(--text-secondary);
                }
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-Title-root {
                    color: var(--text-primary);
                }
                [data-mantine-color-scheme="dark"] .advanced-filters .mantine-Divider-root {
                    border-color: var(--border);
                }
            `}</style>
        </>
    );
}
