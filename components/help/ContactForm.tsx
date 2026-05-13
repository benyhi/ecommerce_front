"use client";

import React, { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { TextInput, Textarea, Select, Button, Stack, Paper, Title, Text, Grid, Center } from "@mantine/core";

export default function ContactForm() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise((r) => setTimeout(r, 1200));
        setSent(true);
        setLoading(false);
    }

    if (sent) {
        return (
            <Paper p="xl" withBorder radius="md" className="animate-scale-in">
                <Center>
                    <Stack align="center" gap="md">
                        <CheckCircle size={48} style={{ color: "var(--success)" }} />
                        <div style={{ textAlign: "center" }}>
                            <Title order={3} size="h4" mb={8}>¡Mensaje enviado!</Title>
                            <Text c="dimmed" size="sm">Te respondemos en menos de 24 horas hábiles.</Text>
                        </div>
                        <Button 
                            variant="light" 
                            onClick={() => { 
                                setSent(false); 
                                setForm({ name: "", email: "", subject: "", message: "" }); 
                            }}
                        >
                            Enviar otro mensaje
                        </Button>
                    </Stack>
                </Center>
            </Paper>
        );
    }

    return (
        <Paper component="form" onSubmit={handleSubmit} p="lg" withBorder radius="md">
            <Stack gap="md">
                <div>
                    <Title order={3} size="h4" mb={4}>Contactanos</Title>
                    <Text c="dimmed" size="sm">Completá el formulario y te responderemos a la brevedad.</Text>
                </div>

                <Grid>
                    <Grid.Col span={6}>
                        <TextInput
                            label="Nombre *"
                            name="name"
                            required
                            placeholder="Juan Pérez"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput
                            label="Email *"
                            name="email"
                            type="email"
                            required
                            placeholder="juan@email.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </Grid.Col>
                </Grid>

                <Select
                    label="Asunto *"
                    name="subject"
                    required
                    placeholder="Seleccioná un asunto..."
                    value={form.subject}
                    onChange={(value) => setForm((f) => ({ ...f, subject: value || "" }))}
                    data={[
                        { value: "compra", label: "Consulta de compra" },
                        { value: "envio", label: "Envío y seguimiento" },
                        { value: "garantia", label: "Garantía y devoluciones" },
                        { value: "soporte", label: "Soporte técnico" },
                        { value: "empresa", label: "Consulta empresarial" },
                        { value: "otro", label: "Otro" },
                    ]}
                />

                <Textarea
                    label="Mensaje *"
                    name="message"
                    required
                    rows={5}
                    placeholder="Contanos en qué podemos ayudarte..."
                    value={form.message}
                    onChange={handleChange}
                    autosize
                    minRows={5}
                />

                <Button
                    type="submit"
                    leftSection={<Send size={16} />}
                    loading={loading}
                    style={{ alignSelf: "flex-end" }}
                >
                    Enviar mensaje
                </Button>
            </Stack>
        </Paper>
    );
}
