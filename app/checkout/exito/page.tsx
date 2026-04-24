"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { Suspense } from "react";

function ExitoContent() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id");

  return (
    <div style={{ maxWidth: 560, margin: "5rem auto", padding: "0 1.5rem", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
        <CheckCircle size={44} color="#22c55e" />
      </div>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: ".5rem" }}>¡Pago aprobado!</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>
        Tu pago fue procesado correctamente. En breve recibirás la confirmación por email.
      </p>
      {paymentId && (
        <p style={{ fontSize: ".8rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
          N° de referencia: <strong>{paymentId.slice(0, 8).toUpperCase()}</strong>
        </p>
      )}
      <Link href="/catalogo" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", justifyContent: "center" }}>
        <ShoppingBag size={16} /> Seguir comprando
      </Link>
    </div>
  );
}

export default function ExitoPage() {
  return (
    <Suspense>
      <ExitoContent />
    </Suspense>
  );
}
