"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Save, RefreshCw } from "lucide-react";
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  TextInput, 
  Textarea, 
  ColorInput,
  Paper, 
  Stack, 
  Group,
  Grid
} from "@mantine/core";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandContext";
import { getTenantBranding, updateTenantBrandingConfig } from "@/lib/api";
import type { BrandConfig } from "@/types";

interface BrandingFormState {
  store_name: string;
  brand_name: string;
  logo_url: string;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_primary_text: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  business_hours: string;
  map_embed_url: string;
  map_title: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_image: string;
}

function toForm(config: BrandConfig): BrandingFormState {
  return {
    store_name: config.store_name,
    brand_name: config.brand_name,
    logo_url: config.logo_url ?? "",
    color_primary: config.color_primary,
    color_secondary: config.color_secondary,
    color_background: config.color_background,
    color_primary_text: config.color_primary_text,
    tagline: config.tagline,
    address: config.contact.address,
    phone: config.contact.phone,
    whatsapp: config.contact.whatsapp,
    email: config.contact.email,
    business_hours: config.contact.business_hours,
    map_embed_url: config.contact.map_embed_url,
    map_title: config.contact.map_title,
    seo_title: config.seo.title,
    seo_description: config.seo.description,
    seo_keywords: config.seo.keywords,
    seo_image: config.seo.seo_image ?? "",
  };
}

export default function AdminBrandingPage() {
  const { user, isAuthenticated, tenantSlug } = useAuth();
  const { branding } = useBranding();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [form, setForm] = useState(() => toForm(branding));

  const canEdit = useMemo(() => {
    return isAuthenticated && (user?.role === "admin" || user?.role === "editor");
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    setForm(toForm(branding));
  }, [branding]);

  async function reloadFromApi() {
    setLoading(true);
    setStatus("");
    try {
      const current = await getTenantBranding(tenantSlug || undefined);
      setForm(toForm(current));
      setStatus("Configuración recargada");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo recargar branding");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      await updateTenantBrandingConfig(
        {
          store_name: form.store_name,
          brand_name: form.brand_name,
          logo_url: form.logo_url || null,
          color_primary: form.color_primary,
          color_secondary: form.color_secondary,
          color_primary_text: form.color_primary_text,
          tagline: form.tagline,
          contact: {
            address: form.address,
            phone: form.phone,
            whatsapp: form.whatsapp,
            email: form.email,
            business_hours: form.business_hours,
            map_embed_url: form.map_embed_url,
            map_title: form.map_title,
          },
          seo: {
            title: form.seo_title,
            description: form.seo_description,
            keywords: form.seo_keywords,
            seo_image: form.seo_image || null,
          },
        },
        tenantSlug || undefined
      );

      setStatus("Branding guardado. Refrescando vista...");
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No se pudo guardar branding");
    } finally {
      setSaving(false);
    }
  }

  if (!canEdit) {
    return (
      <Container size="md" py="xl">
        <Title order={1} mb="xs">Panel de Branding</Title>
        <Text c="dimmed">
          Necesitás iniciar sesión con rol admin/editor para editar la marca del tenant.
        </Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb={4}>Panel de Branding</Title>
          <Text size="sm" c="dimmed">
            Tenant actual: <strong>{tenantSlug || "default"}</strong>
          </Text>
        </div>
        <Button 
          variant="light" 
          leftSection={<RefreshCw size={14} />}
          onClick={reloadFromApi} 
          disabled={loading || saving}
          loading={loading}
        >
          Recargar
        </Button>
      </Group>

      <Paper component="form" onSubmit={handleSubmit} p="lg" withBorder>
        <Stack gap="lg">
          <Title order={2} size="h4">Marca</Title>

          <Grid>
            <Grid.Col span={6}>
              <TextInput 
                label="Nombre de la tienda" 
                value={form.store_name} 
                onChange={(e) => setForm((f) => ({ ...f, store_name: e.target.value }))}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput 
                label="Nombre de la marca" 
                value={form.brand_name} 
                onChange={(e) => setForm((f) => ({ ...f, brand_name: e.target.value }))}
              />
            </Grid.Col>
          </Grid>

          <TextInput 
            label="URL de imagen de logo" 
            value={form.logo_url} 
            onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
            placeholder="https://ejemplo.com/imagen.jpg" 
          />
          
          <TextInput 
            label="Eslogan" 
            value={form.tagline} 
            onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
          />

          <Grid>
            <Grid.Col span={3}>
              <ColorInput 
                label="Color primario" 
                value={form.color_primary} 
                onChange={(v) => setForm((f) => ({ ...f, color_primary: v }))}
                format="hex"
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <ColorInput 
                label="Color secundario" 
                value={form.color_secondary} 
                onChange={(v) => setForm((f) => ({ ...f, color_secondary: v }))}
                format="hex"
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <ColorInput 
                label="Color de fondo" 
                value={form.color_background} 
                onChange={(v) => setForm((f) => ({ ...f, color_background: v }))}
                format="hex"
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <ColorInput 
                label="Color de texto" 
                value={form.color_primary_text} 
                onChange={(v) => setForm((f) => ({ ...f, color_primary_text: v }))}
                format="hex"
              />
            </Grid.Col>
          </Grid>

          <Title order={2} size="h4" mt="sm">Contacto</Title>
          
          <TextInput 
            label="Dirección" 
            value={form.address} 
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />

          <Grid>
            <Grid.Col span={4}>
              <TextInput 
                label="Teléfono" 
                value={form.phone} 
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput 
                label="WhatsApp" 
                value={form.whatsapp} 
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput 
                label="Email" 
                value={form.email} 
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Grid.Col>
          </Grid>

          <TextInput 
            label="Horarios" 
            value={form.business_hours} 
            onChange={(e) => setForm((f) => ({ ...f, business_hours: e.target.value }))}
          />
          
          <TextInput 
            label="Mapa embed URL" 
            value={form.map_embed_url} 
            onChange={(e) => setForm((f) => ({ ...f, map_embed_url: e.target.value }))}
          />
          
          <TextInput 
            label="Título del mapa" 
            value={form.map_title} 
            onChange={(e) => setForm((f) => ({ ...f, map_title: e.target.value }))}
          />

          <Title order={2} size="h4" mt="sm">SEO</Title>
          
          <TextInput 
            label="Titulo en buscadores" 
            value={form.seo_title} 
            onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
          />
          
          <Textarea 
            label="Descripción en buscadores" 
            value={form.seo_description} 
            onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
            rows={3}
            autosize
          />
          
          <TextInput 
            label="URL de imagen para buscadores (Open Graph)" 
            value={form.seo_image} 
            onChange={(e) => setForm((f) => ({ ...f, seo_image: e.target.value }))}
            placeholder="https://ejemplo.com/imagen-og.jpg" 
          />

          {status && (
            <Text size="sm" c="dimmed">{status}</Text>
          )}

          <Group justify="flex-end">
            <Button 
              type="submit" 
              leftSection={<Save size={14} />}
              disabled={saving || loading}
              loading={saving}
            >
              Guardar cambios
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
