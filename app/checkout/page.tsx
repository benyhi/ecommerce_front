"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCart } from "@/contexts/CartContext";
import { checkout, prepareCheckout, validateCoupon, getEnabledGateways, type GatewayConfig, type GatewayId, type CouponValidationResult } from "@/lib/payments";
import { getTenantBranding } from "@/lib/api";
import { ArrowLeft, ArrowRight, CreditCard, Landmark, Smartphone, Banknote, ShoppingCart, Loader2, Tag, X, CheckCircle, AlertCircle, Truck, MapPin } from "lucide-react";

const MPCardBrick = dynamic(() => import("@/components/checkout/MPCardBrick"), { ssr: false, loading: () => null });

type DeliveryType = "shipping" | "pickup";
type PaymentMethod = GatewayId | "cash";

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(n);
}

function parsePaymentError(err: unknown): string {
  if (!(err instanceof Error)) return "Error inesperado. Intente nuevamente.";

  const match = err.message.match(/^API error (\d+): (.+)$/s);
  if (match) {
    const statusCode = parseInt(match[1], 10);
    let body: Record<string, unknown> = {};
    try { body = JSON.parse(match[2]); } catch { /* body no es JSON */ }

    const msg =
      (body.error as string) ||
      (body.detail as string) ||
      (Array.isArray(body.non_field_errors) ? (body.non_field_errors as string[]).join(", ") : undefined) ||
      (body.message as string);

    if (msg) return msg;

    if (statusCode === 400) return "Los datos enviados son inválidos. Verificá los campos e intentá nuevamente.";
    if (statusCode === 404) return "El recurso solicitado no fue encontrado. Verificá la configuración de pago.";
    if (statusCode === 422) return "Hubo un error al procesar tu solicitud. Verificá los datos e intentá de nuevo.";
    if (statusCode >= 500) return "El servidor tuvo un problema. Intente nuevamente en unos minutos.";
    return `Error ${statusCode}. Intente nuevamente.`;
  }

  if (err.message.toLowerCase().includes("failed to fetch") || err.message.toLowerCase().includes("network")) {
    return "Sin conexión a internet. Verificá tu conexión e intentá nuevamente.";
  }

  return err.message || "Error inesperado. Intente nuevamente.";
}

type RedirectState = {
  active: boolean;
  destination: string;
  message: string;
};

const PAYMENT_META: Record<PaymentMethod, { label: string; description: string; Icon: React.FC<{ size?: number }> }> = {
  mercadopago: { label: "MercadoPago", description: "Tarjetas, Mercado Crédito, saldo MP", Icon: Smartphone },
  naranja_x: { label: "Naranja X", description: "Tarjeta Naranja y billetera", Icon: CreditCard },
  card: { label: "Tarjeta de crédito", description: "Visa, Mastercard, Amex — en cuotas", Icon: CreditCard },
  debit: { label: "Tarjeta de débito", description: "Pago inmediato sin intereses", Icon: CreditCard },
  transfer: { label: "Transferencia bancaria", description: "CBU / alias — acreditación en 24 hs", Icon: Landmark },
  cash: { label: "Efectivo en el local", description: "Pagás al retirar tu pedido", Icon: Banknote },
};

type InstallmentOption = { value: number; label: string };
const INSTALLMENT_OPTIONS: InstallmentOption[] = [
  { value: 1, label: "1 cuota (sin interés)" },
  { value: 3, label: "3 cuotas" },
  { value: 6, label: "6 cuotas" },
  { value: 12, label: "12 cuotas" },
  { value: 18, label: "18 cuotas" },
  { value: 24, label: "24 cuotas" },
];

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: step >= 1 ? "var(--accent)" : "transparent",
          border: `2px solid ${step >= 1 ? "var(--accent)" : "var(--border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: step >= 1 ? "#fff" : "var(--text-muted)",
          fontSize: ".8rem", fontWeight: 700, flexShrink: 0,
        }}>
          {step > 1 ? <CheckCircle size={14} /> : "1"}
        </div>
        <span style={{ fontSize: ".9rem", fontWeight: step === 1 ? 700 : 500, color: step === 1 ? "var(--text-primary)" : "var(--text-muted)" }}>
          Entrega
        </span>
      </div>

      <div style={{ flex: 1, height: 1, background: "var(--border)", maxWidth: 48 }} />

      <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: step >= 2 ? "var(--accent)" : "transparent",
          border: `2px solid ${step >= 2 ? "var(--accent)" : "var(--border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: step >= 2 ? "#fff" : "var(--text-muted)",
          fontSize: ".8rem", fontWeight: 700, flexShrink: 0,
        }}>
          2
        </div>
        <span style={{ fontSize: ".9rem", fontWeight: step === 2 ? 700 : 500, color: step === 2 ? "var(--text-primary)" : "var(--text-muted)" }}>
          Pago
        </span>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, closeCart } = useCart();

  const [step, setStep] = useState<1 | 2>(1);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("shipping");
  const [shippingCost, setShippingCost] = useState(0);

  const [gateways, setGateways] = useState<GatewayConfig[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [installments, setInstallments] = useState(1);
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [shippingAddress, setShippingAddress] = useState({ street: "", city: "", province: "", postalCode: "" });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [redirect, setRedirect] = useState<RedirectState>({ active: false, destination: "", message: "" });

  useEffect(() => {
    closeCart();

    getTenantBranding().then((branding) => {
      setShippingCost(branding.shipping_cost ?? 0);
    }).catch(() => {});

    getEnabledGateways().then((list) => {
      setGateways(list);
    }).finally(() => setLoadingGateways(false));
  }, [closeCart]);

  // Auto-seleccionar método de pago cuando cambia deliveryType o gateways
  useEffect(() => {
    if (gateways.length === 0 && deliveryType !== "pickup") return;
    setSelectedPayment((prev) => {
      const available: PaymentMethod[] = deliveryType === "pickup"
        ? ["cash", ...gateways.map((gw) => gw.gateway as GatewayId)]
        : gateways.map((gw) => gw.gateway as GatewayId);
      if (!prev || !available.includes(prev)) return available[0] ?? null;
      return prev;
    });
  }, [deliveryType, gateways]);

  const availablePayments: PaymentMethod[] = deliveryType === "pickup"
    ? ["cash", ...gateways.map((gw) => gw.gateway as GatewayId)]
    : gateways.map((gw) => gw.gateway as GatewayId);

  const shippingForTotal = deliveryType === "shipping" ? shippingCost : 0;
  const isCardPayment = selectedPayment === "card" || selectedPayment === "debit";
  const discount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount ?? "0") : 0;
  const finalTotal = Math.max(0, total + shippingForTotal - discount);

  async function handleApplyCoupon() {
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(code, total);
      if (result.valid) {
        setAppliedCoupon(result);
        setCouponError(null);
      } else {
        setCouponError(result.message);
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Error al validar el cupón. Intente nuevamente.");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  }

  function handleMPCardSuccess(paymentId: string, paymentStatus: string) {
    clearCart();
    if (paymentStatus === "approved") {
      setRedirect({ active: true, destination: "confirmación", message: "¡Pago aprobado! Redirigiendo a la confirmación." });
      setTimeout(() => router.push(`/checkout/exito?payment_id=${paymentId}`), 1800);
    } else if (paymentStatus === "pending" || paymentStatus === "in_process") {
      setRedirect({ active: true, destination: "estado del pago", message: "Pago en proceso. Redirigiendo al estado del pago." });
      setTimeout(() => router.push(`/checkout/pendiente?payment_id=${paymentId}`), 1800);
    } else {
      setError("El pago fue rechazado. Por favor, intentá con otra tarjeta.");
    }
  }

  function handleMPCardError(msg: string) {
    setError(msg);
  }

  function toPaymentMethod(p: PaymentMethod): "cash" | "transfer" | "card" | "mercadopago" {
    if (p === "debit") return "card";
    if (p === "naranja_x") return "card";
    return p as "cash" | "transfer" | "card" | "mercadopago";
  }

  async function handlePay() {
    if (!selectedPayment || items.length === 0) return;

    if (!payerName.trim()) { setError("Por favor ingresá tu nombre completo."); return; }
    if (!payerEmail.trim() || !payerEmail.includes("@")) { setError("Por favor ingresá un email válido."); return; }

    setLoading(true);
    setError(null);
    try {
      const result = await checkout({
        customer_name: payerName,
        customer_email: payerEmail,
        customer_phone: payerPhone,
        delivery_type: deliveryType,
        payment_method: toPaymentMethod(selectedPayment),
        items: items.map((i) => ({
          product: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: i.unitPrice,
        })),
        coupon_code: appliedCoupon?.code ?? undefined,
        installments: isCardPayment ? installments : 1,
        shipping_street: shippingAddress.street,
        shipping_city: shippingAddress.city,
        shipping_province: shippingAddress.province,
        shipping_postal_code: shippingAddress.postalCode,
      });

      clearCart();

      if (result.checkout_url) {
        setRedirect({ active: true, destination: "MercadoPago", message: "Será redirigido a MercadoPago para completar el pago de forma segura." });
        setTimeout(() => { window.location.href = result.checkout_url!; }, 1800);
      } else if (selectedPayment === "transfer") {
        setRedirect({ active: true, destination: "instrucciones de transferencia", message: "Pago registrado. Será redirigido a las instrucciones de transferencia." });
        setTimeout(() => router.push(`/checkout/pendiente?payment_id=${result.payment_id}`), 1800);
      } else if (selectedPayment === "cash") {
        setRedirect({ active: true, destination: "confirmación", message: "¡Pedido registrado! Pasá a retirarlo y abonás en el local." });
        setTimeout(() => router.push(`/checkout/exito?payment_id=${result.payment_id}`), 1800);
      } else {
        setRedirect({ active: true, destination: "confirmación", message: "¡Pago registrado correctamente! Redirigiendo a la confirmación." });
        setTimeout(() => router.push(`/checkout/exito?payment_id=${result.payment_id}`), 1800);
      }
    } catch (err) {
      setError(parsePaymentError(err));
    } finally {
      setLoading(false);
    }
  }

  // ── Pantalla de redirección ──────────────────────────────────────────────
  if (redirect.active) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,.12)", border: "2px solid rgba(34,197,94,.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <CheckCircle size={36} style={{ color: "#22c55e" }} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: ".75rem" }}>¡Todo listo!</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>{redirect.message}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".6rem", color: "var(--text-muted)", fontSize: ".9rem" }}>
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            Redirigiendo a {redirect.destination}...
          </div>
        </div>
      </div>
    );
  }

  // ── Carrito vacío ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 640, margin: "4rem auto", padding: "0 1.5rem", textAlign: "center" }}>
        <ShoppingCart size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
        <h2 style={{ marginBottom: ".5rem" }}>Tu carrito está vacío</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Agregá productos antes de proceder al pago.</p>
        <Link href="/catalogo" className="btn-primary">Ver catálogo</Link>
      </div>
    );
  }

  // ── Paso 1: Elección de forma de entrega ─────────────────────────────────
  if (step === 1) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.5rem", minHeight: "100vh" }}>
        <Link href="/catalogo" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", color: "var(--accent)", fontWeight: 600, marginBottom: "1.5rem", textDecoration: "none" }}>
          <ArrowLeft size={16} /> Seguir comprando
        </Link>

        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1.5rem" }}>Finalizar compra</h1>

        <StepIndicator step={1} />

        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.25rem" }}>Elegir forma de entrega</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
          {/* Envío a domicilio */}
          <button
            onClick={() => setDeliveryType("shipping")}
            style={{
              display: "flex", alignItems: "center", gap: "1.25rem",
              padding: "1.25rem 1.5rem",
              background: deliveryType === "shipping" ? "rgba(99,102,241,.06)" : "var(--bg-elevated)",
              border: `2px solid ${deliveryType === "shipping" ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 16, cursor: "pointer", textAlign: "left", width: "100%",
              transition: "border-color .15s, background .15s",
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: deliveryType === "shipping" ? "var(--accent)" : "var(--bg-card)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: "background .15s",
            }}>
              <Truck size={22} style={{ color: deliveryType === "shipping" ? "#fff" : "var(--text-muted)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>Enviar a domicilio</p>
              <p style={{ margin: ".2rem 0 0", fontSize: ".85rem", color: "var(--text-muted)" }}>
                {shippingCost > 0 ? `Costo de envío: ${formatPrice(shippingCost)}` : "Envío gratis"}
              </p>
            </div>
            {deliveryType === "shipping" && <CheckCircle size={20} style={{ color: "var(--accent)", flexShrink: 0 }} />}
          </button>

          {/* Retiro en local */}
          <button
            onClick={() => setDeliveryType("pickup")}
            style={{
              display: "flex", alignItems: "center", gap: "1.25rem",
              padding: "1.25rem 1.5rem",
              background: deliveryType === "pickup" ? "rgba(99,102,241,.06)" : "var(--bg-elevated)",
              border: `2px solid ${deliveryType === "pickup" ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 16, cursor: "pointer", textAlign: "left", width: "100%",
              transition: "border-color .15s, background .15s",
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: deliveryType === "pickup" ? "var(--accent)" : "var(--bg-card)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: "background .15s",
            }}>
              <MapPin size={22} style={{ color: deliveryType === "pickup" ? "#fff" : "var(--text-muted)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>Retirar en el local</p>
              <p style={{ margin: ".2rem 0 0", fontSize: ".85rem", color: "var(--text-muted)" }}>Sin costo adicional · Podés pagar en efectivo</p>
            </div>
            {deliveryType === "pickup" && <CheckCircle size={20} style={{ color: "var(--accent)", flexShrink: 0 }} />}
          </button>
        </div>

        {deliveryType === "shipping" && (
          <section style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
              <MapPin size={18} style={{ color: "var(--accent)" }} /> Dirección de envío
            </h2>
            <div style={{ display: "grid", gap: ".75rem" }}>
              <input
                type="text" placeholder="Calle y número"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress((a) => ({ ...a, street: e.target.value }))}
                style={inputStyle}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
                <input
                  type="text" placeholder="Ciudad"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress((a) => ({ ...a, city: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="text" placeholder="Provincia"
                  value={shippingAddress.province}
                  onChange={(e) => setShippingAddress((a) => ({ ...a, province: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <input
                type="text" placeholder="Código postal"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress((a) => ({ ...a, postalCode: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </section>
        )}

        <button
          onClick={() => setStep(2)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem",
            width: "100%", padding: "1rem", background: "var(--accent)", color: "#fff",
            border: "none", borderRadius: 12, fontSize: "1rem", fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Continuar al pago <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // ── Paso 2: Pago ─────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem", minHeight: "100vh" }}>
      <Link href="/catalogo" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", color: "var(--accent)", fontWeight: 600, marginBottom: "1.5rem", textDecoration: "none" }}>
        <ArrowLeft size={16} /> Seguir comprando
      </Link>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1.5rem" }}>Finalizar compra</h1>

      <StepIndicator step={2} />

      {/* Indicador de entrega seleccionada */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: ".75rem 1.25rem",
        background: "rgba(99,102,241,.06)", border: "1px solid rgba(99,102,241,.2)",
        borderRadius: 12, marginBottom: "1.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
          {deliveryType === "shipping"
            ? <Truck size={16} style={{ color: "var(--accent)" }} />
            : <MapPin size={16} style={{ color: "var(--accent)" }} />
          }
          <span style={{ fontSize: ".9rem", fontWeight: 600 }}>
            {deliveryType === "shipping" ? "Enviar a domicilio" : "Retirar en el local"}
          </span>
          {deliveryType === "shipping" && shippingCost > 0 && (
            <span style={{ fontSize: ".85rem", color: "var(--text-muted)" }}>
              · Envío: {formatPrice(shippingCost)}
            </span>
          )}
        </div>
        <button
          onClick={() => setStep(1)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: ".85rem", fontWeight: 600, padding: "2px 8px" }}
        >
          Cambiar
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,340px)", gap: "2rem", alignItems: "start" }}>

        {/* Left: formulario de pago */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Datos del comprador */}
          <section style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Tus datos</h2>
            <div style={{ display: "grid", gap: ".75rem" }}>
              <input
                type="text" placeholder="Nombre completo" value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                style={inputStyle}
              />
              <input
                type="email" placeholder="Email" value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                style={inputStyle}
              />
              <input
                type="tel" placeholder="Teléfono (opcional)" value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
                style={inputStyle}
              />
            </div>
          </section>

          {/* Cupón de descuento */}
          <section style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Cupón de descuento</h2>
            {appliedCoupon ? (
              <div style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".75rem 1rem", background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 10 }}>
                <Tag size={18} style={{ color: "#22c55e", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#22c55e" }}>{appliedCoupon.code}</p>
                  <p style={{ margin: 0, fontSize: ".8rem", color: "var(--text-muted)" }}>
                    Descuento: {formatPrice(discount)}
                  </p>
                </div>
                <button onClick={handleRemoveCoupon} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--text-muted)" }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: ".5rem" }}>
                <input
                  type="text"
                  placeholder="Código de cupón"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value); setCouponError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  style={{ padding: ".7rem 1.25rem", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: couponLoading || !couponCode.trim() ? "not-allowed" : "pointer", opacity: couponLoading || !couponCode.trim() ? .6 : 1, whiteSpace: "nowrap", fontSize: ".9rem" }}
                >
                  {couponLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Aplicar"}
                </button>
              </div>
            )}
            {couponError && (
              <p style={{ margin: ".5rem 0 0", fontSize: ".85rem", color: "#ef4444" }}>{couponError}</p>
            )}
          </section>

          {/* Método de pago */}
          <section style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Método de pago</h2>

            {loadingGateways && deliveryType !== "pickup" ? (
              <div style={{ display: "flex", alignItems: "center", gap: ".5rem", color: "var(--text-muted)" }}>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Cargando métodos...
              </div>
            ) : availablePayments.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>No hay métodos de pago disponibles.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                {availablePayments.map((method) => {
                  const meta = PAYMENT_META[method];
                  const Icon = meta?.Icon ?? Banknote;
                  const active = selectedPayment === method;
                  return (
                    <button
                      key={method}
                      onClick={() => setSelectedPayment(method)}
                      style={{
                        display: "flex", alignItems: "center", gap: "1rem",
                        padding: "1rem 1.25rem",
                        background: active ? "rgba(99,102,241,.08)" : "var(--bg-card)",
                        border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 12, cursor: "pointer", textAlign: "left", width: "100%",
                        transition: "border-color .15s, background .15s",
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: active ? "var(--accent)" : "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>{meta?.label ?? method}</p>
                        <p style={{ margin: 0, fontSize: ".8rem", color: "var(--text-muted)" }}>{meta?.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Cuotas (solo para tarjeta) */}
            {isCardPayment && (
              <div style={{ marginTop: "1rem" }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: ".4rem", fontSize: ".9rem" }}>Cuotas</label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {INSTALLMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {installments > 1 && (
                  <p style={{ margin: ".4rem 0 0", fontSize: ".8rem", color: "var(--text-muted)" }}>
                    {formatPrice(finalTotal / installments)} × {installments} cuotas
                  </p>
                )}
              </div>
            )}
          </section>

          {error && (
            <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.35)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
              <AlertCircle size={20} style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ margin: "0 0 .2rem", fontWeight: 700, color: "#ef4444", fontSize: ".9rem" }}>No se pudo procesar el pago</p>
                <p style={{ margin: 0, color: "#ef4444", fontSize: ".85rem", lineHeight: 1.5 }}>{error}</p>
              </div>
              <button onClick={() => setError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 2, marginLeft: "auto", flexShrink: 0 }}>
                <X size={16} />
              </button>
            </div>
          )}

          {selectedPayment === "mercadopago" ? (
            <MPCardBrick
              amount={finalTotal}
              payerName={payerName}
              payerEmail={payerEmail}
              onPrepareOrder={async () => {
                const res = await prepareCheckout({
                  customer_name: payerName,
                  customer_email: payerEmail,
                  customer_phone: payerPhone,
                  delivery_type: deliveryType,
                  items: items.map((i) => ({
                    product: i.product.id,
                    product_name: i.product.name,
                    quantity: i.quantity,
                    unit_price: i.unitPrice,
                  })),
                  coupon_code: appliedCoupon?.code ?? undefined,
                  shipping_street: shippingAddress.street,
                  shipping_city: shippingAddress.city,
                  shipping_province: shippingAddress.province,
                  shipping_postal_code: shippingAddress.postalCode,
                });
                return res.order_id;
              }}
              onSuccess={handleMPCardSuccess}
              onPaymentError={handleMPCardError}
            />
          ) : (
            <button
              onClick={handlePay}
              disabled={loading || !selectedPayment || availablePayments.length === 0}
              className="btn-primary"
              style={{ justifyContent: "center", padding: "1rem", fontSize: "1rem", opacity: loading || !selectedPayment ? .7 : 1 }}
            >
              {loading
                ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />Procesando...</>
                : selectedPayment === "cash"
                  ? <><Banknote size={18} style={{ marginRight: 8 }} />Confirmar pedido</>
                  : <><CreditCard size={18} style={{ marginRight: 8 }} />Pagar {formatPrice(finalTotal)}</>
              }
            </button>
          )}
        </div>

        {/* Right: resumen del pedido */}
        <aside style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", position: "sticky", top: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Resumen del pedido</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: ".75rem", maxHeight: 360, overflowY: "auto" }}>
            {items.map((item) => (
              <div key={item.cartItemId} style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
                <div style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden", background: "var(--bg-card)", border: "1px solid var(--border)", flexShrink: 0 }}>
                  {item.product.image_url ? (
                    <Image src={item.product.image_url} alt={item.product.name} width={50} height={50} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><ShoppingCart size={18} /></div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: ".85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product.name}</p>
                  <p style={{ margin: 0, fontSize: ".75rem", color: "var(--text-muted)" }}>x{item.quantity}</p>
                </div>
                <span style={{ fontWeight: 700, fontSize: ".9rem", whiteSpace: "nowrap" }}>{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--border)", marginTop: "1rem", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".9rem", color: "var(--text-muted)" }}>
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            {deliveryType === "shipping" && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".9rem", color: "var(--text-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                  <Truck size={14} /> Envío
                </span>
                <span>{shippingCost > 0 ? formatPrice(shippingCost) : "Gratis"}</span>
              </div>
            )}
            {discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".9rem", color: "#22c55e" }}>
                <span style={{ display: "flex", alignItems: "center", gap: ".3rem" }}><Tag size={14} /> {appliedCoupon?.code}</span>
                <span>− {formatPrice(discount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", borderTop: "1px solid var(--border)", paddingTop: ".5rem", marginTop: ".25rem" }}>
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: ".7rem 1rem",
  border: "1px solid var(--border)", borderRadius: 8,
  background: "var(--bg-card)", color: "var(--text-primary)",
  fontSize: ".9rem", outline: "none", boxSizing: "border-box",
};
