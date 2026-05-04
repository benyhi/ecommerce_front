"use client";

import { useEffect, useRef, useState } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { AlertCircle, Loader2 } from "lucide-react";
import { getMPPublicKey, initiateMPCardPayment } from "@/lib/payments";

interface Props {
  amount: number;
  payerName: string;
  payerEmail: string;
  tenantSlug?: string;
  onPrepareOrder?: () => Promise<string>;
  onSuccess: (paymentId: string, status: string) => void;
  onPaymentError: (error: string) => void;
}

// Evita llamar a initMercadoPago más de una vez por sesión de página
let _mpInitialized = false;

export default function MPCardBrick({
  amount,
  payerName,
  payerEmail,
  tenantSlug,
  onPrepareOrder,
  onSuccess,
  onPaymentError,
}: Props) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Ref para que onSubmit siempre lea el nombre actualizado sin remontarse
  const payerNameRef = useRef(payerName);
  useEffect(() => { payerNameRef.current = payerName; }, [payerName]);

  useEffect(() => {
    let cancelled = false;

    if (_mpInitialized) {
      setReady(true);
      return;
    }

    getMPPublicKey(tenantSlug)
      .then((key) => {
        if (cancelled) return;
        initMercadoPago(key, { locale: "es-AR" });
        _mpInitialized = true;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled)
          setLoadError("No se pudo cargar el formulario de tarjeta. Verificá la configuración de MercadoPago.");
      });

    return () => { cancelled = true; };
  }, [tenantSlug]);

  if (loadError) {
    return (
      <div style={{ display: "flex", gap: ".5rem", color: "#ef4444", fontSize: ".9rem", padding: ".75rem 0" }}>
        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
        {loadError}
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: ".5rem", color: "var(--text-muted)", padding: "1rem 0" }}>
        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
        Cargando formulario de tarjeta...
      </div>
    );
  }

  return (
    // key={amount} forza el remontaje del Brick si el monto cambia (ej.: cupón aplicado)
    <CardPayment
      key={amount}
      initialization={{ amount, payer: { email: payerEmail } }}
      onSubmit={async (formData) => {
        if (!payerNameRef.current.trim()) {
          const msg = "Por favor completá tu nombre en el formulario superior.";
          onPaymentError(msg);
          throw new Error(msg);
        }

        let orderId: string | undefined;
        if (onPrepareOrder) {
          try {
            orderId = await onPrepareOrder();
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Error al registrar el pedido.";
            onPaymentError(msg);
            throw new Error(msg);
          }
        }

        const result = await initiateMPCardPayment(
          {
            amount,
            card_token: formData.token,
            payment_method_id: formData.payment_method_id,
            installments: formData.installments,
            payer_name: payerNameRef.current,
            payer_email: formData.payer?.email ?? payerEmail,
            order_id: orderId,
          },
          tenantSlug
        );

        if (result.success) {
          onSuccess(result.payment_id, result.status);
        } else {
          const msg = result.error ?? "Error al procesar el pago.";
          onPaymentError(msg);
          throw new Error(msg);
        }
      }}
      onError={(err) => {
        const msg = (err as { message?: string }).message ?? "Error en el formulario de tarjeta.";
        onPaymentError(msg);
      }}
    />
  );
}
