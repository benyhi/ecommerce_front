"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { Modal, TextInput, PasswordInput, Button, Stack, Text, Alert, Grid } from "@mantine/core";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export default function RegisterModal({ onClose, onSwitchToLogin }: Props) {
    const { register } = useAuth();
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        password2: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (form.password !== form.password2) {
            setError("Las contraseñas no coinciden");
            return;
        }
        if (form.password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres");
            return;
        }
        setLoading(true);
        try {
            await register({
                username: form.username || form.email,
                email: form.email,
                password: form.password,
                first_name: form.first_name,
                last_name: form.last_name,
            });
            onClose();
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Error al registrarse. Intentá de nuevo."
            );
        } finally {
            setLoading(false);
        }
    }



    return (
        <Modal
            opened={true}
            onClose={onClose}
            title={
                <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                    <UserPlus size={20} />
                    <Text fw={700} size="lg">Crear cuenta</Text>
                </div>
            }
            centered
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    {error && (
                        <Alert color="red" variant="light">
                            {error}
                        </Alert>
                    )}

                    <Grid>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Nombre"
                                name="first_name"
                                placeholder="Juan"
                                value={form.first_name}
                                onChange={handleChange}
                            />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput
                                label="Apellido"
                                name="last_name"
                                placeholder="Pérez"
                                value={form.last_name}
                                onChange={handleChange}
                            />
                        </Grid.Col>
                    </Grid>

                    <TextInput
                        label="Email *"
                        name="email"
                        type="email"
                        placeholder="juan@email.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <TextInput
                        label="Usuario"
                        name="username"
                        placeholder="juanperez"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />

                    <PasswordInput
                        label="Contraseña *"
                        name="password"
                        placeholder="Mínimo 8 caracteres"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <PasswordInput
                        label="Confirmar contraseña *"
                        name="password2"
                        placeholder="Repetí tu contraseña"
                        value={form.password2}
                        onChange={handleChange}
                        required
                    />

                    <Button
                        type="submit"
                        fullWidth
                        leftSection={<UserPlus size={16} />}
                        loading={loading}
                    >
                        Crear cuenta
                    </Button>

                    <Text size="sm" ta="center" c="dimmed">
                        ¿Ya tenés cuenta?{" "}
                        <Text
                            component="button"
                            type="button"
                            onClick={onSwitchToLogin}
                            c="blue"
                            fw={600}
                            style={{ background: "none", border: "none", cursor: "pointer" }}
                        >
                            Iniciar sesión
                        </Text>
                    </Text>
                </Stack>
            </form>
        </Modal>
    );
}
