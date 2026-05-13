"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Loader2, UserRound, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { changePasswordApi } from "@/lib/api";

function parseApiError(error: unknown) {
  if (!(error instanceof Error)) return "No se pudo completar la operacion.";
  const match = error.message.match(/^API error \d+: (.+)$/s);
  if (!match) return error.message;
  try {
    const body = JSON.parse(match[1]) as Record<string, unknown>;
    const first = Object.values(body)[0];
    if (Array.isArray(first)) return first.join(" ");
    if (typeof first === "string") return first;
    if (typeof body.detail === "string") return body.detail;
  } catch {
    return error.message;
  }
  return "Verifica los datos e intenta nuevamente.";
}

export default function PerfilPage() {
  const router = useRouter();
  const { user, accessToken, tenantSlug, isAuthenticated, loading, updateProfile } = useAuth();

  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email ?? "",
      });
    }
  }, [user]);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setProfileSaving(true);
    setError(null);
    setProfileMessage(null);
    try {
      await updateProfile(profileForm);
      setProfileMessage("Datos guardados.");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;
    setPasswordSaving(true);
    setError(null);
    setPasswordMessage(null);
    try {
      await changePasswordApi(accessToken, passwordForm, tenantSlug);
      setPasswordForm({ current_password: "", new_password: "", new_password_confirm: "" });
      setPasswordMessage("Contrasena actualizada.");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setPasswordSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", color: "var(--accent)", fontWeight: 600, marginBottom: "1.5rem", textDecoration: "none" }}>
        <ArrowLeft size={16} /> Volver
      </Link>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1.5rem" }}>Mi perfil</h1>

      {error && (
        <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.35)", borderRadius: 8, padding: "1rem", color: "#ef4444", marginBottom: "1rem", fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "1rem", alignItems: "start" }}>
        <form onSubmit={handleProfileSubmit} style={panelStyle}>
          <h2 style={titleStyle}><UserRound size={18} /> Datos personales</h2>
          <label style={labelStyle}>Nombre</label>
          <input value={profileForm.first_name} onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))} style={inputStyle} />
          <label style={labelStyle}>Apellido</label>
          <input value={profileForm.last_name} onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))} style={inputStyle} />
          <label style={labelStyle}>Email</label>
          <input type="email" required value={profileForm.email} onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} />
          <button type="submit" disabled={profileSaving} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}>
            {profileSaving ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Guardando...</> : "Guardar cambios"}
          </button>
          {profileMessage && <p style={successStyle}><CheckCircle size={16} /> {profileMessage}</p>}
        </form>

        <form onSubmit={handlePasswordSubmit} style={panelStyle}>
          <h2 style={titleStyle}><KeyRound size={18} /> Cambiar contrasena</h2>
          <label style={labelStyle}>Contrasena actual</label>
          <input type="password" required value={passwordForm.current_password} onChange={(e) => setPasswordForm((f) => ({ ...f, current_password: e.target.value }))} style={inputStyle} />
          <label style={labelStyle}>Nueva contrasena</label>
          <input type="password" required value={passwordForm.new_password} onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))} style={inputStyle} />
          <label style={labelStyle}>Confirmar nueva contrasena</label>
          <input type="password" required value={passwordForm.new_password_confirm} onChange={(e) => setPasswordForm((f) => ({ ...f, new_password_confirm: e.target.value }))} style={inputStyle} />
          <button type="submit" disabled={passwordSaving} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}>
            {passwordSaving ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Guardando...</> : "Actualizar contrasena"}
          </button>
          {passwordMessage && <p style={successStyle}><CheckCircle size={16} /> {passwordMessage}</p>}
        </form>
      </div>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "1.5rem",
};

const titleStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: ".5rem",
  fontSize: "1.05rem",
  fontWeight: 800,
  marginBottom: "1rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: ".7rem 1rem",
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "var(--bg-card)",
  color: "var(--text-primary)",
  fontSize: ".9rem",
  outline: "none",
  boxSizing: "border-box",
  marginBottom: ".75rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: ".35rem",
  fontSize: ".875rem",
};

const successStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: ".4rem",
  color: "#22c55e",
  fontWeight: 700,
  marginTop: ".75rem",
};
