"use client";

import React, { useState } from "react";
import { LogIn } from "lucide-react";
import { Modal, TextInput, PasswordInput, Button, Stack, Text, Alert } from "@mantine/core";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
    onClose: () => void;
    onSwitchToRegister: () => void;
}

export default function LoginModal({ onClose, onSwitchToRegister }: Props) {
    const { login, tenantSlug } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            onClose();
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message.includes("401")
                        ? "Credenciales incorrectas"
                        : "Error al iniciar sesión. Intentá de nuevo."
                    : "Error desconocido"
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
                    <LogIn size={20} />
                    <div>
                        <Text fw={700} size="lg">Iniciar sesión</Text>
                        {tenantSlug && tenantSlug !== "default" && (
                            <Text size="xs" c="dimmed">
                                Tienda: <strong>{tenantSlug}</strong>
                            </Text>
                        )}
                    </div>
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

                    <TextInput
                        label="Email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />

                    <PasswordInput
                        label="Contraseña"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button
                        type="submit"
                        fullWidth
                        leftSection={<LogIn size={16} />}
                        loading={loading}
                    >
                        Iniciar sesión
                    </Button>

                    <Text size="sm" ta="center" c="dimmed">
                        ¿No tenés cuenta?{" "}
                        <Text
                            component="button"
                            type="button"
                            onClick={onSwitchToRegister}
                            c="blue"
                            fw={600}
                            style={{ background: "none", border: "none", cursor: "pointer" }}
                        >
                            Registrarse
                        </Text>
                    </Text>
                </Stack>
            </form>
        </Modal>
    );
}
