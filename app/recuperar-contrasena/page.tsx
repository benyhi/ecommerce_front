"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { CheckCircle, ArrowLeft, Loader2 } from "lucide-react";

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "techstore";

function RecuperarContent() {
  const params = useSearchParams();
  const router = useRouter();

  const uid = params.get("uid");
  const token = params.get("token");
  const isConfirmMode = !!uid && !!token;

  // Request mode state
  const [email, setEmail] = useState("");
  const [requestDone, setRequestDone] = useState(false);

  // Confirm mode state
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [confirmDone, setConfirmDone] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/auth/password-reset/", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), tenant: DEFAULT_TENANT }),
        tenantSlug: DEFAULT_TENANT,
      });
      setRequestDone(true);
    } catch {
      setError("Ocurrió un error. Verificá el email e intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/auth/password-reset/confirm/", {
        method: "POST",
        body: JSON.stringify({ uid, token, new_password: password }),
        tenantSlug: DEFAULT_TENANT,
      });
      setConfirmDone(true);
      setTimeout(() => router.push("/"), 3000);
    } catch {
      setError("El enlace expiró o es inválido. Solicitá un nuevo enlace.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 440, margin: "5rem auto", padding: "0 1.5rem" }}>
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", color: "var(--accent)", fontWeight: 600, marginBottom: "2rem", textDecoration: "none" }}>
        <ArrowLeft size={16} /> Volver al inicio
      </Link>

      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "2rem" }}>
        {/* Request mode */}
        {!isConfirmMode && (
          requestDone ? (
            <div style={{ textAlign: "center" }}>
              <CheckCircle size={48} color="#22c55e" style={{ marginBottom: "1rem" }} />
              <h2 style={{ fontWeight: 800, marginBottom: ".5rem" }}>¡Revisá tu email!</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                Si el email existe, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRequest}>
              <h1 style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: ".5rem" }}>Recuperar contraseña</h1>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: ".9rem" }}>
                Ingresá tu email y te enviaremos un enlace para crear una nueva contraseña.
              </p>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" style={inputStyle} />
              {error && <p style={{ color: "#ef4444", fontSize: ".85rem", marginTop: ".5rem" }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1.25rem", padding: ".85rem" }}>
                {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite", marginRight: 6 }} />Enviando...</> : "Enviar enlace"}
              </button>
            </form>
          )
        )}

        {/* Confirm mode */}
        {isConfirmMode && (
          confirmDone ? (
            <div style={{ textAlign: "center" }}>
              <CheckCircle size={48} color="#22c55e" style={{ marginBottom: "1rem" }} />
              <h2 style={{ fontWeight: 800, marginBottom: ".5rem" }}>¡Contraseña actualizada!</h2>
              <p style={{ color: "var(--text-muted)" }}>Serás redirigido al inicio en un momento...</p>
            </div>
          ) : (
            <form onSubmit={handleConfirm}>
              <h1 style={{ fontWeight: 800, fontSize: "1.5rem", marginBottom: ".5rem" }}>Nueva contraseña</h1>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: ".9rem" }}>Elegí una contraseña segura de al menos 8 caracteres.</p>
              <label style={labelStyle}>Nueva contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="Mínimo 8 caracteres" style={{ ...inputStyle, marginBottom: ".75rem" }} />
              <label style={labelStyle}>Confirmar contraseña</label>
              <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required minLength={8} placeholder="Repetí la contraseña" style={inputStyle} />
              {error && <p style={{ color: "#ef4444", fontSize: ".85rem", marginTop: ".5rem" }}>{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "1.25rem", padding: ".85rem" }}>
                {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite", marginRight: 6 }} />Guardando...</> : "Guardar contraseña"}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}

export default function RecuperarContrasenaPage() {
  return (
    <Suspense>
      <RecuperarContent />
    </Suspense>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: ".7rem 1rem",
  border: "1px solid var(--border)", borderRadius: 8,
  background: "var(--bg-card)", color: "var(--text-primary)",
  fontSize: ".9rem", outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontWeight: 600, marginBottom: ".35rem", fontSize: ".875rem",
};
