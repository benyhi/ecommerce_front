"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Container,
    Divider,
    Grid,
    Group,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { ArrowLeft, ShoppingCart, CheckCircle, Truck, Shield, Package, Box } from "lucide-react";
import { getProduct, getProductBadges } from "@/lib/api";
import { storeInfo } from "@/lib/storeConfig";
import type { CartItem, ProductReadOnly, ProductBadge, SelectedOption } from "@/types";
import ProductCard from "@/components/catalog/ProductCard";
import { useCart } from "@/contexts/CartContext";

const BUY_NOW_STORAGE_KEY = "buyNowCheckoutItem";

function formatPrice(n: number) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency", currency: "ARS", minimumFractionDigits: 0,
    }).format(n);
}

export default function ProductDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { addItem } = useCart();

    const [product, setProduct] = useState<ProductReadOnly | null>(null);
    const [badges, setBadges] = useState<ProductBadge[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
    const [added, setAdded] = useState<"none" | "cart">("none");
    const [activeImage, setActiveImage] = useState<string | null>(null);

    useEffect(() => {
        const tenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "techstore";
        setLoading(true);
        Promise.all([
            getProduct(params.id, undefined, tenant),
            getProductBadges(tenant),
        ])
            .then(([p, b]) => { setProduct(p); setBadges(b); })
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [params.id]);

    // All hooks must be called before early returns
    const gallery = useMemo(() => {
        if (!product) return [];
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

    if (loading) {
        return (
            <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader size="lg" />
            </div>
        );
    }

    if (!product) {
        return (
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.5rem" }}>
                <Link href="/catalogo" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", color: "var(--accent)", fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Volver al catálogo
                </Link>
                <div style={{ marginTop: "2rem", padding: "2rem", border: "1px solid var(--border)", borderRadius: 16, background: "var(--bg-elevated)", textAlign: "center" }}>
                    <Package size={40} style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }} />
                    <h2 style={{ marginBottom: "0.5rem" }}>Producto no encontrado</h2>
                    <p style={{ color: "var(--text-muted)" }}>El producto que buscás no existe o ya no está disponible.</p>
                </div>
            </div>
        );
    }

    // product is narrowed to ProductReadOnly beyond this point
    const category = product.category;
    const subcategory = product.subcategory;
    const optionGroups = product.option_groups ?? [];

    function toggleOption(groupId: string, groupName: string, optionId: string, maxChoices: number) {
        const group = optionGroups.find((g) => g.id === groupId);
        const opt = group?.options.find((o) => o.id === optionId);
        if (!group || !opt) return;

        setSelectedOptions((prev) => {
            const alreadySelected = prev.find((s) => s.groupId === groupId && s.option.id === optionId);
            if (alreadySelected) {
                return prev.filter((s) => !(s.groupId === groupId && s.option.id === optionId));
            }
            const groupSelections = prev.filter((s) => s.groupId === groupId);
            if (groupSelections.length >= maxChoices) {
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

    const sortedGroups = [...optionGroups].sort((a, b) => a.order - b.order);
    const requiredMet = sortedGroups
        .filter((g) => g.required)
        .every((g) => selectedOptions.some((s) => s.groupId === g.id));

    const extrasPrice = selectedOptions.reduce((acc, s) => acc + parseFloat(s.option.price), 0);
    const basePrice = parseFloat(product.price);
    const unitPrice = basePrice + extrasPrice;
    const comparePrice = product.compare_at_price ? parseFloat(product.compare_at_price) + extrasPrice : null;
    const totalPrice = unitPrice * quantity;
    const discountPercent = comparePrice ? Math.max(0, Math.round((1 - unitPrice / comparePrice) * 100)) : null;

    function buildCartItemId(productId: string, selected: SelectedOption[]) {
        const opts = selected
            .map((s) => `${s.groupId}:${s.option.id}`)
            .sort()
            .join("|");
        return `${productId}-${opts}`;
    }

    function handleBuyNow() {
        if (!requiredMet || !product) return;
        const item: CartItem = {
            cartItemId: buildCartItemId(product.id, selectedOptions),
            product,
            quantity,
            selectedOptions,
            unitPrice,
        };
        sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify([item]));
        router.push("/checkout?mode=buy-now");
    }

    function handleAddToCart() {
        if (!requiredMet || !product) return;
        addItem(product, selectedOptions, quantity);
        setAdded("cart");
    }

    const related: ProductReadOnly[] = [];

    return (
        <Container size="lg" px="md" py="xl" style={{ minHeight: "100vh" }}>
            <Group gap="sm" mb="md">
                <Button
                    component={Link}
                    href="/catalogo"
                    variant="subtle"
                    leftSection={<ArrowLeft size={16} />}
                    radius="md"
                >
                    Volver al catálogo
                </Button>
            </Group>

            <Grid gutter="xl" align="flex-start">
                {/* Galería */}
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Grid gutter="md">
                        {gallery.length > 1 && (
                            <Grid.Col span={{ base: 12, sm: 3 }}>
                                <Stack gap="xs">
                                    {gallery.map((img) => {
                                        const active = img === activeImage;
                                        return (
                                            <Card
                                                key={img}
                                                withBorder
                                                padding={4}
                                                radius="md"
                                                style={{ cursor: "pointer", borderColor: active ? "var(--accent)" : undefined }}
                                                onClick={() => setActiveImage(img)}
                                            >
                                                <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
                                                    <Image src={img} alt={product.name} fill sizes="120px" style={{ objectFit: "cover", borderRadius: 10 }} />
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </Stack>
                            </Grid.Col>
                        )}

                        <Grid.Col span={{ base: 12, sm: gallery.length > 1 ? 9 : 12 }}>
                            <Card withBorder padding={0} radius="lg" style={{ overflow: "hidden" }}>
                                <div style={{ position: "relative", width: "100%", paddingBottom: "68%", background: "var(--bg-elevated)" }}>
                                    {activeImage ? (
                                        <Image src={activeImage} alt={product.name} fill sizes="720px" style={{ objectFit: "cover" }} />
                                    ) : (
                                        <Stack h="100%" align="center" justify="center" style={{ position: "absolute", inset: 0 }}>
                                            <ShoppingCart size={32} color="var(--text-muted)" />
                                        </Stack>
                                    )}
                                </div>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Grid.Col>

                {/* Resumen */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Paper withBorder radius="lg" p="lg" bg="var(--bg-elevated)">
                        <Stack gap="md">
                            <Group justify="space-between" align="flex-start">
                                <div>
                                    <Text c="dimmed" size="sm">
                                        {subcategory ? `${category.name} / ${subcategory.name}` : category.name}
                                    </Text>
                                    <Title order={2} style={{ lineHeight: 1.2 }}>{product.name}</Title>
                                </div>
                                {product.is_offer && (
                                    <Badge color="blue" variant="filled">Oferta</Badge>
                                )}
                            </Group>

                            <Group align="flex-end" gap="sm">
                                <div>
                                    {comparePrice !== null && (
                                        <Text size="sm" c="dimmed" td="line-through">{formatPrice(comparePrice)}</Text>
                                    )}
                                    <Title order={2}>{formatPrice(unitPrice)}</Title>
                                </div>
                                {discountPercent !== null && (
                                    <Badge color="green" variant="filled">-{discountPercent}%</Badge>
                                )}
                                <Badge variant="outline" color="gray">{product.stock ?? 0} unidades</Badge>
                            </Group>

                            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                                {(badges.length > 0 ? badges : storeInfo.shippingCards).map((card) => {
                                    const iconName = (card as ProductBadge).icon ?? (card as typeof storeInfo.shippingCards[0]).icon;
                                    const icon = iconName === "truck" ? <Truck size={18} /> : iconName === "shield" ? <Shield size={18} /> : <Box size={18} />;
                                    return (
                                        <Paper key={card.title} withBorder radius="md" p="sm" bg="var(--bg-card)">
                                            <Group align="flex-start" gap="sm">
                                                <ThemeIcon variant="light" color="blue" size="md">{icon}</ThemeIcon>
                                                <div>
                                                    <Text fw={700}>{card.title}</Text>
                                                    <Text size="sm" c="dimmed">{card.description}</Text>
                                                </div>
                                            </Group>
                                        </Paper>
                                    );
                                })}
                            </SimpleGrid>

                            <Text c="var(--text-secondary)">{product.description}</Text>

                            {sortedGroups.length > 0 && (
                                <Stack gap="sm">
                                    <Title order={4}>Opciones</Title>
                                    {sortedGroups.map((group) => {
                                        const selectedCount = selectedOptions.filter((s) => s.groupId === group.id).length;
                                        return (
                                            <Paper key={group.id} withBorder radius="md" p="sm" bg="var(--bg-card)">
                                                <Group justify="space-between" align="center" mb="xs">
                                                    <Group gap="xs" align="center">
                                                        <Text fw={700}>{group.name}</Text>
                                                        {group.required && <Badge color="red" variant="light" size="xs">Requerido</Badge>}
                                                    </Group>
                                                    <Text size="sm" c="dimmed">{group.max_choices === 1 ? "Elegí 1" : `Hasta ${group.max_choices}`} · {selectedCount} seleccionado{selectedCount !== 1 ? "s" : ""}</Text>
                                                </Group>
                                                <Group gap="xs">
                                                    {[...group.options]
                                                        .sort((a, b) => a.order - b.order)
                                                        .filter((o) => o.active)
                                                        .map((opt) => {
                                                            const sel = isSelected(group.id, opt.id);
                                                            const isColor = group.name.toLowerCase().includes("color") && opt.swatch_hex;
                                                            const extra = parseFloat(opt.price);
                                                            return (
                                                                <Button
                                                                    key={opt.id}
                                                                    variant={sel ? "light" : "default"}
                                                                    color={sel ? "blue" : "gray"}
                                                                    size="xs"
                                                                    radius="md"
                                                                    onClick={() => toggleOption(group.id, group.name, opt.id, group.max_choices)}
                                                                    leftSection={isColor ? <span style={{ width: 14, height: 14, borderRadius: "50%", background: opt.swatch_hex ?? "#ccc", border: "1px solid rgba(0,0,0,.15)" }} /> : undefined}
                                                                >
                                                                    <Group gap={6} align="center">
                                                                        <Text size="sm" fw={600}>{opt.name}</Text>
                                                                        {extra > 0 && (
                                                                            <Text size="xs" c="dimmed">+{formatPrice(extra)}</Text>
                                                                        )}
                                                                        {sel && <CheckCircle size={14} />}
                                                                    </Group>
                                                                </Button>
                                                            );
                                                        })}
                                                </Group>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            )}

                            <Group align="center" gap="md" wrap="wrap">
                                <Group gap={0} align="center" style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                                    <ActionIcon variant="subtle" color="gray" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</ActionIcon>
                                    <Text fw={800} px="sm">{quantity}</Text>
                                    <ActionIcon variant="subtle" color="gray" onClick={() => setQuantity((q) => q + 1)}>+</ActionIcon>
                                </Group>
                                <Group gap={6} ml="auto">
                                    <Text c="dimmed" size="sm">Total</Text>
                                    <Text fw={800}>{formatPrice(totalPrice)}</Text>
                                </Group>
                            </Group>

                            <Stack gap="sm">
                                <Button
                                    radius="md"
                                    size="md"
                                    onClick={handleBuyNow}
                                    disabled={!requiredMet}
                                    fullWidth
                                >
                                    Comprar ahora
                                </Button>
                                <Button
                                    radius="md"
                                    size="md"
                                    variant="light"
                                    leftSection={<ShoppingCart size={16} />}
                                    onClick={handleAddToCart}
                                    disabled={!requiredMet}
                                    fullWidth
                                >
                                    Agregar al carrito
                                </Button>
                                {!requiredMet && (
                                    <Text size="sm" c="red">Seleccioná las opciones requeridas para continuar.</Text>
                                )}
                                {added !== "none" && (
                                    <Text size="sm" c="green" fw={600} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <CheckCircle size={16} /> Producto agregado al carrito.
                                    </Text>
                                )}
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>

            <Divider my="xl" />

            {(product.attributes?.length > 0 || storeInfo.shippingDetails.length > 0) && (
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mb="xl">
                    {product.attributes?.length > 0 && (
                        <Paper withBorder radius="md" p="md" bg="var(--bg-elevated)">
                            <Title order={4} mb={8}>Características</Title>
                            <Stack gap={4}>
                                {[...product.attributes].sort((a, b) => a.order - b.order).map((attr) => (
                                    <Group key={attr.id} justify="space-between" gap="xs">
                                        <Text size="sm" c="dimmed">{attr.name}</Text>
                                        <Text size="sm" fw={600}>{attr.value}</Text>
                                    </Group>
                                ))}
                            </Stack>
                        </Paper>
                    )}
                    <Paper withBorder radius="md" p="md" bg="var(--bg-elevated)">
                        <Title order={4} mb={8}>Detalles del envío</Title>
                        <Stack gap={4}>
                            {storeInfo.shippingDetails.map((line) => (
                                <Text key={line} c="var(--text-secondary)">{line}</Text>
                            ))}
                        </Stack>
                    </Paper>
                </SimpleGrid>
            )}

            {related.length > 0 && (
                <Stack gap="sm" mb="xl">
                    <Group gap="xs">
                        <Title order={4}>Productos relacionados</Title>
                        <Badge color="blue" variant="light">{related.length}</Badge>
                    </Group>
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                        {related.map((p) => (
                            <ProductCard key={p.id} product={p} onClick={() => router.push(`/catalogo/${p.id}`)} />
                        ))}
                    </SimpleGrid>
                </Stack>
            )}
        </Container>
    );
}
