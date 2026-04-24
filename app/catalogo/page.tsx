"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    Badge,
    Button,
    Drawer,
    Group,
    Loader,
    Stack,
    Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import SearchBar from "@/components/catalog/SearchBar";
import ProductCard from "@/components/catalog/ProductCard";
import AdvancedFilters, { type SortOption } from "@/components/catalog/AdvancedFilters";
import { getCategories } from "@/lib/api";
import type { Product, Category } from "@/types";
import { Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CatalogoPage() {
    const [search, setSearch] = useState("");
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
    const router = useRouter();
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [priceMinFilter, setPriceMinFilter] = useState<number | null>(null);
    const [priceMaxFilter, setPriceMaxFilter] = useState<number | null>(null);
    const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<SortOption>("relevance");
    const [onlyOffers, setOnlyOffers] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(true);
    const isMobile = useMediaQuery("(max-width: 960px)");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        setFiltersOpen(!isMobile);
    }, [isMobile]);

    useEffect(() => {
        const tenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "techstore";
        getCategories(undefined, tenant)
            .then((data) => setCategories(data.filter((c) => c.active)))
            .catch(() => setCategories([]))
            .finally(() => setLoadingCategories(false));
    }, []);

    // Debounce search
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(id);
    }, [search]);

    const allActiveProducts = useMemo(() => {
        const list: Array<{ product: Product; category: Category }> = [];
        for (const cat of categories) {
            for (const p of cat.products) {
                if (!p.active) continue;
                list.push({ product: p, category: cat });
            }
        }
        return list;
    }, [categories]);

    const priceBounds = useMemo(() => {
        if (allActiveProducts.length === 0) return { min: 0, max: 0 };
        const prices = allActiveProducts.map(({ product }) => parseFloat(product.price));
        return { min: Math.min(...prices), max: Math.max(...prices) };
    }, [allActiveProducts]);

    const brandOptions = useMemo(() => {
        const set = new Set<string>();
        for (const { product } of allActiveProducts) {
            if (product.brand) set.add(product.brand);
        }
        return [...set].sort((a, b) => a.localeCompare(b));
    }, [allActiveProducts]);

    const appliedFiltersCount = useMemo(() => {
        let count = 0;
        if (priceMinFilter !== null && priceMinFilter > priceBounds.min) count += 1;
        if (priceMaxFilter !== null && priceMaxFilter < priceBounds.max) count += 1;
        if (activeCategoryId !== null) count += 1;
        count += selectedBrands.size;
        if (onlyOffers) count += 1;
        return count;
    }, [priceMinFilter, priceMaxFilter, priceBounds, activeCategoryId, selectedBrands, onlyOffers]);

    useEffect(() => {
        if (allActiveProducts.length === 0) return;
        setPriceMinFilter((prev) => (prev === null ? priceBounds.min : prev));
        setPriceMaxFilter((prev) => (prev === null ? priceBounds.max : prev));
    }, [allActiveProducts, priceBounds]);

    const filteredProducts = useMemo(() => {
        const results: Array<{ product: Product; category: Category }> = [];
        for (const cat of categories) {
            if (activeCategoryId !== null && cat.id !== activeCategoryId) continue;
            for (const p of cat.products) {
                if (!p.active) continue;
                const price = parseFloat(p.price);
                if (
                    debouncedSearch &&
                    !p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
                    !p.description.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
                    !cat.name.toLowerCase().includes(debouncedSearch.toLowerCase())
                ) {
                    continue;
                }
                if (priceMinFilter !== null && price < priceMinFilter) continue;
                if (priceMaxFilter !== null && price > priceMaxFilter) continue;
                if (onlyOffers && !p.is_offer) continue;
                if (selectedBrands.size > 0) {
                    if (!p.brand || !selectedBrands.has(p.brand)) continue;
                }
                results.push({ product: p, category: cat });
            }
        }
        return results.sort((a, b) => {
            if (sortBy === "price_asc") return parseFloat(a.product.price) - parseFloat(b.product.price);
            if (sortBy === "price_desc") return parseFloat(b.product.price) - parseFloat(a.product.price);
            return a.product.order - b.product.order;
        });
    }, [categories, activeCategoryId, debouncedSearch, priceMinFilter, priceMaxFilter, selectedBrands, sortBy, onlyOffers]);

    // Group filtered products by category for display
    const groupedByCategory = useMemo(() => {
        const map = new Map<string, { category: Category; products: Product[] }>();
        for (const { product, category } of filteredProducts) {
            if (!map.has(category.id)) {
                map.set(category.id, { category, products: [] });
            }
            map.get(category.id)!.products.push(product);
        }
        return [...map.values()].sort((a, b) => a.category.order - b.category.order);
    }, [filteredProducts]);

    function toggleBrand(brand: string) {
        setSelectedBrands((prev) => {
            const next = new Set(prev);
            if (next.has(brand)) next.delete(brand);
            else next.add(brand);
            return next;
        });
    }

    function resetFilters() {
        setPriceMinFilter(priceBounds.min);
        setPriceMaxFilter(priceBounds.max);
        setSelectedBrands(new Set());
        setSortBy("relevance");
        setOnlyOffers(false);
    }

    function openProduct(product: Product) {
        router.push(`/catalogo/${product.id}`);
    }

    if (loadingCategories) {
        return (
            <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader size="lg" />
            </div>
        );
    }

    return (
        <div style={{ minHeight: "80vh", background: "var(--bg-primary)" }}>
            {/* Page header */}
            <div
                style={{
                    background: "linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-elevated) 100%)",
                    borderBottom: "1px solid var(--border)",
                    padding: "2.5rem 0",
                }}
            >
                <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
                    <h1 className="section-title" style={{ marginBottom: ".5rem" }}>
                        Catálogo de productos
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: ".95rem" }}>
                        {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} disponible{filteredProducts.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
                {/* Search aligned with filters grid */}
                <div
                    className="catalog-controls"
                    style={{
                        display: "grid",
                        gap: "1.5rem",
                        alignItems: "center",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div className="controls-spacer" />
                    <Group gap="0.75rem" align="center" wrap="wrap" style={{ flex: 1 }}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="filters-toggle-btn"
                            onClick={() => setFiltersOpen((v) => !v)}
                            aria-expanded={filtersOpen}
                            radius="md"
                        >
                            <Group gap={8} align="center">
                                <Text size="sm" fw={600}>Filtros</Text>
                                {appliedFiltersCount > 0 && (
                                    <Badge color="blue" variant="light" fw={700} size="sm">
                                        {appliedFiltersCount}
                                    </Badge>
                                )}
                            </Group>
                        </Button>
                        <div style={{ flex: 1, minWidth: 260 }}>
                            <SearchBar value={search} onChange={setSearch} />
                        </div>
                    </Group>
                </div>

                <div className="catalog-layout" style={{ display: "grid", gap: "1.5rem", alignItems: "start" }}>
                    {!isMobile && (
                        <AdvancedFilters
                            priceMin={priceBounds.min}
                            priceMax={priceBounds.max}
                            valueMin={priceMinFilter}
                            valueMax={priceMaxFilter}
                            onPriceMinChange={setPriceMinFilter}
                            onPriceMaxChange={setPriceMaxFilter}
                            brands={brandOptions}
                            selectedBrands={selectedBrands}
                            onToggleBrand={toggleBrand}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                            onlyOffers={onlyOffers}
                            onToggleOffers={() => setOnlyOffers((v) => !v)}
                            categories={categories}
                            activeCategoryId={activeCategoryId}
                            onSelectCategory={setActiveCategoryId}
                            appliedCount={appliedFiltersCount}
                            onReset={() => { resetFilters(); setSearch(""); setActiveCategoryId(null); }}
                            onClose={() => setFiltersOpen(false)}
                            isMobile={false}
                        />
                    )}

                    {filteredProducts.length === 0 ? (
                        <div
                            style={{
                                display: "flex", flexDirection: "column", alignItems: "center",
                                justifyContent: "center", padding: "4rem 0",
                                color: "var(--text-muted)", gap: "1rem",
                            }}
                        >
                            <Package size={48} strokeWidth={1} />
                            <div style={{ textAlign: "center" }}>
                                <p style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: ".25rem" }}>
                                    No encontramos productos
                                </p>
                                <p style={{ fontSize: ".875rem" }}>
                                    Ajustá los filtros o buscá otro término
                                </p>
                            </div>
                            <button
                                className="btn-ghost"
                                onClick={() => { setSearch(""); setActiveCategoryId(null); resetFilters(); }}
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
                            {groupedByCategory.map(({ category, products }) => (
                                <div key={category.id}>
                                    {/* Category header */}
                                    <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1.25rem" }}>
                                        <h2
                                            style={{
                                                fontWeight: 700, fontSize: "1.1rem",
                                                color: "var(--text-primary)", whiteSpace: "nowrap",
                                            }}
                                        >
                                            {category.name}
                                        </h2>
                                        <span className="badge badge-accent">{products.length}</span>
                                        <div style={{ flex: 1, height: 1, background: "var(--border)", borderRadius: 1 }} />
                                    </div>

                                    {/* Products grid */}
                                    <div
                                        className="products-grid"
                                        style={{
                                            display: "grid",
                                            gap: "1rem",
                                        }}
                                    >
                                        {[...products]
                                            .sort((a, b) => {
                                                if (sortBy === "price_asc") return parseFloat(a.price) - parseFloat(b.price);
                                                if (sortBy === "price_desc") return parseFloat(b.price) - parseFloat(a.price);
                                                return a.order - b.order;
                                            })
                                            .map((p) => (
                                                <ProductCard
                                                    key={p.id}
                                                    product={p}
                                                    onClick={() => openProduct(p)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Drawer
                    opened={filtersOpen && (isMobile ?? false)}
                    onClose={() => setFiltersOpen(false)}
                    position="bottom"
                    size="80vh"
                    withCloseButton={false}
                    overlayProps={{ opacity: 0.4, blur: 0 }}
                    withinPortal
                    styles={{ content: { padding: 0, borderRadius: 0, boxShadow: "0 -8px 30px rgba(0,0,0,.35)", overflow: "auto" } }}
                >
                    <AdvancedFilters
                        priceMin={priceBounds.min}
                        priceMax={priceBounds.max}
                        valueMin={priceMinFilter}
                        valueMax={priceMaxFilter}
                        onPriceMinChange={setPriceMinFilter}
                        onPriceMaxChange={setPriceMaxFilter}
                        brands={brandOptions}
                        selectedBrands={selectedBrands}
                        onToggleBrand={toggleBrand}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        onlyOffers={onlyOffers}
                        onToggleOffers={() => setOnlyOffers((v) => !v)}
                        categories={categories}
                        activeCategoryId={activeCategoryId}
                        onSelectCategory={setActiveCategoryId}
                        appliedCount={appliedFiltersCount}
                        onReset={() => { resetFilters(); setSearch(""); setActiveCategoryId(null); }}
                        onClose={() => setFiltersOpen(false)}
                        isMobile
                    />
                </Drawer>

                                <style>{`
                    .catalog-controls {
                        grid-template-columns: minmax(260px, 280px) 1fr;
                    }
                    .catalog-layout {
                        grid-template-columns: minmax(260px, 280px) 1fr;
                    }
                    .products-grid {
                        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    }
                    .catalog-filters { width: 100%; }
                    .filters-toggle-btn { display: none; }
                    .controls-spacer { display: block; }
                    @media (max-width: 1200px) {
                        .products-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
                    }
                    @media (max-width: 960px) {
                        .catalog-controls { grid-template-columns: 1fr; }
                        .catalog-layout { grid-template-columns: 1fr; }
                        .catalog-filters { position: static !important; }
                        .filters-toggle-btn { display: inline-flex; }
                        .controls-spacer { display: none; }
                    }
                    @media (max-width: 640px) {
                        .products-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
                        .catalog-controls { margin-bottom: 1rem; }
                    }
                `}</style>
            </div>

        </div>
    );
}
