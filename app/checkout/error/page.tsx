"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RotateCcw } from "lucide-react";
import { Suspense } from "react";

function ErrorContent() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id");

  return (
    <div style={{ maxWidth: 560, margin: "5rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(239,68,68,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
        <XCircle size={44} color="#ef4444" />
      </div>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: ".5rem" }}>Pago rechazado</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
        No pudimos procesar tu pago. Verificá los datos de tu tarjeta o intentá con otro método de pago.
      </p>
      {paymentId && (
        <p style={{ fontSize: ".8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          N° de referencia: <strong>{paymentId.slice(0, 8).toUpperCase()}</strong>
        </p>
      )}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/checkout" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem" }}>
          <RotateCcw size={16} /> Reintentar
        </Link>
        <Link href="/catalogo" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", padding: ".7rem 1.5rem", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600 }}>
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}
