"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Copy, CheckCircle } from "lucide-react";
import { getPaymentStatus, type PaymentStatus } from "@/lib/payments";
import { Suspense } from "react";

function PendienteContent() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id");
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) return;
    getPaymentStatus(paymentId).then(setPayment).catch(() => null);
  }, [paymentId]);

  const transferMeta = payment?.gateway_response ?? null;

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div style={{ maxWidth: 620, margin: "4rem auto", padding: "0 1.5rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(245,158,11,.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <Clock size={44} color="#f59e0b" />
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: ".5rem" }}>Pago pendiente</h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
          Realizá la transferencia con los datos de abajo. Una vez acreditado, confirmaremos tu pedido.
        </p>
      </div>

      {/* Datos bancarios */}
      <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Datos para la transferencia</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
          {[
            { label: "Banco", value: transferMeta?.bank_name, key: "bank" },
            { label: "Titular", value: transferMeta?.account_holder, key: "holder" },
            { label: "CBU", value: transferMeta?.cbu, key: "cbu" },
            { label: "Alias", value: transferMeta?.alias, key: "alias" },
            { label: "Monto exacto", value: transferMeta?.amount ? `$ ${transferMeta.amount}` : payment ? `$ ${payment.amount}` : undefined, key: "amount" },
            { label: "Referencia", value: transferMeta?.reference ?? paymentId?.slice(0, 8).toUpperCase(), key: "ref" },
          ].filter((r) => r.value).map(({ label, value, key }) => (
            <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: ".6rem .75rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <div>
                <p style={{ margin: 0, fontSize: ".75rem", color: "var(--text-muted)" }}>{label}</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: ".95rem" }}>{value}</p>
              </div>
              <button onClick={() => copyText(value!, key)} style={{ border: "none", background: "transparent", cursor: "pointer", color: copied === key ? "#22c55e" : "var(--text-muted)", padding: ".25rem" }}>
                {copied === key ? <CheckCircle size={16} /> : <Copy size={16} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "rgba(99,102,241,.06)", border: "1px solid rgba(99,102,241,.2)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "2rem", fontSize: ".875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
        <strong>Importante:</strong> incluí la referencia en el comentario de la transferencia. Acreditación en hasta 24 horas hábiles.
      </div>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <Link href="/catalogo" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", justifyContent: "center" }}>
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}

export default function PendientePage() {
  return (
    <Suspense>
      <PendienteContent />
    </Suspense>
  );
}
