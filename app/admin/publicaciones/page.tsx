"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Badge,
    Button,
    Container,
    Group,
    NumberInput,
    Paper,
    Select,
    Stack,
    Text,
    TextInput,
    Textarea,
    Title,
    Notification,
} from "@mantine/core";
import { CheckCircle, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { mockCategories } from "@/lib/mockData";

export default function PublicacionesPage() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    const [name, setName] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [stock, setStock] = useState<number | "">("");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const categoryOptions = mockCategories.map((c) => ({ value: String(c.id), label: c.name }));

    if (!isAuthenticated) {
        return (
            <Container size="sm" py="xl">
                <Paper withBorder radius="lg" p="lg">
                    <Group gap="sm" align="center" mb="sm">
                        <Lock size={18} />
                        <Title order={4} style={{ margin: 0 }}>Acceso restringido</Title>
                    </Group>
                    <Text c="dimmed" mb="md">Necesitás iniciar sesión para crear publicaciones.</Text>
                    <Button onClick={() => router.push("/login")}>Ir a login</Button>
                </Paper>
            </Container>
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        await new Promise((r) => setTimeout(r, 600));
        setSaving(false);
        setSaved(true);
    }

    return (
        <Container size="md" py="xl">
            <Group justify="space-between" align="flex-end" mb="md">
                <div>
                    <Title order={2}>Nueva publicación</Title>
                    <Text c="dimmed">Cargá un producto rápido. Solo para usuarios autenticados.</Text>
                </div>
                <Badge variant="light" color="blue">{user?.username ?? "usuario"}</Badge>
            </Group>

            <Paper withBorder radius="lg" p="lg" component="form" onSubmit={handleSubmit}>
                <Stack gap="md">
                    <TextInput
                        label="Título del producto"
                        placeholder="Ej. Auriculares inalámbricos"
                        required
                        value={name}
                        onChange={(e) => setName(e.currentTarget.value)}
                    />
                    <Textarea
                        label="Descripción"
                        minRows={3}
                        value={description}
                        onChange={(e) => setDescription(e.currentTarget.value)}
                    />
                    <Group grow>
                        <NumberInput
                            label="Precio"
                            min={0}
                            thousandSeparator="."
                            decimalSeparator="," 
                            value={price}
                            onChange={setPrice}
                            required
                        />
                        <NumberInput
                            label="Stock"
                            min={0}
                            value={stock}
                            onChange={setStock}
                            required
                        />
                    </Group>
                    <Group grow>
                        <TextInput
                            label="Marca"
                            value={brand}
                            onChange={(e) => setBrand(e.currentTarget.value)}
                        />
                        <Select
                            label="Categoría"
                            placeholder="Seleccioná"
                            data={categoryOptions}
                            value={categoryId}
                            onChange={setCategoryId}
                        />
                    </Group>

                    <Group justify="flex-end" gap="sm">
                        <Button type="submit" loading={saving} disabled={!name || !price || !stock || !categoryId}>
                            Publicar
                        </Button>
                    </Group>

                    {saved && (
                        <Notification
                            color="green"
                            icon={<CheckCircle size={18} />}
                            title="Guardado"
                            onClose={() => setSaved(false)}
                        >
                            Publicación creada (simulado). Falta conectar al backend.
                        </Notification>
                    )}
                </Stack>
            </Paper>
        </Container>
    );
}
