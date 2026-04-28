"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useCart } from "@/contexts/CartContext";
import { initiatePayment, validateCoupon, getEnabledGateways, type GatewayConfig, type GatewayId, type CouponValidationResult } from "@/lib/payments";
import { ArrowLeft, CreditCard, Landmark, Smartphone, Banknote, ShoppingCart, Loader2, Tag, X, CheckCircle, AlertCircle } from "lucide-react";

const MPCardBrick = dynamic(() => import("@/components/checkout/MPCardBrick"), { ssr: false, loading: () => null });

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(n);
}

function parsePaymentError(err: unknown): string {
  if (!(err instanceof Error)) return "Error inesperado. Intente nuevamente.";

  // apiFetch lanza: "API error 4XX: <json body>"
  const match = err.message.match(/^API error (\d+): (.+)$/s);
  if (match) {
    const statusCode = parseInt(match[1], 10);
    let body: Record<string, unknown> = {};
    try { body = JSON.parse(match[2]); } catch { /* body no es JSON */ }

    // Extraer mensaje del body
    const msg =
      (body.error as string) ||
      (body.detail as string) ||
      (Array.isArray(body.non_field_errors) ? (body.non_field_errors as string[]).join(", ") : undefined) ||
      (body.message as string);

    if (msg) return msg;

    // Mensajes por código HTTP
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

const GATEWAY_META: Record<GatewayId, { label: string; description: string; Icon: React.FC<{ size?: number }> }> = {
  mercadopago: { label: "MercadoPago", description: "Tarjetas, Mercado Crédito, saldo MP", Icon: Smartphone },
  naranja_x: { label: "Naranja X", description: "Tarjeta Naranja y billetera", Icon: CreditCard },
  card: { label: "Tarjeta de crédito", description: "Visa, Mastercard, Amex — en cuotas", Icon: CreditCard },
  debit: { label: "Tarjeta de débito", description: "Pago inmediato sin intereses", Icon: CreditCard },
  transfer: { label: "Transferencia bancaria", description: "CBU / alias — acreditación en 24 hs", Icon: Landmark },
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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, closeCart } = useCart();

  const [gateways, setGateways] = useState<GatewayConfig[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<GatewayId | null>(null);
  const [installments, setInstallments] = useState(1);
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [redirect, setRedirect] = useState<RedirectState>({ active: false, destination: "", message: "" });

  useEffect(() => {
    closeCart();
    getEnabledGateways().then((list) => {
      setGateways(list);
      if (list.length > 0) setSelectedGateway(list[0].gateway as GatewayId);
    }).finally(() => setLoadingGateways(false));
  }, [closeCart]);

  // mercadopago usa el Card Payment Brick (maneja cuotas internamente)
  const isCardGateway = selectedGateway === "card" || selectedGateway === "debit";
  const discount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount ?? "0") : 0;
  const finalTotal = Math.max(0, total - discount);

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

  async function handlePay() {
    if (!selectedGateway || items.length === 0) return;

    if (!payerName.trim()) { setError("Por favor ingresá tu nombre completo."); return; }
    if (!payerEmail.trim() || !payerEmail.includes("@")) { setError("Por favor ingresá un email válido."); return; }

    setLoading(true);
    setError(null);
    try {
      const result = await initiatePayment({
        gateway: selectedGateway,
        amount: finalTotal,
        payer_name: payerName,
        payer_email: payerEmail,
        payer_phone: payerPhone,
        installments: isCardGateway ? installments : 1,
        coupon_code: appliedCoupon?.code ?? undefined,
        cart_items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: i.unitPrice,
        })),
      });

      if (result.success) {
        clearCart();
        if (result.checkout_url) {
          setRedirect({ active: true, destination: "MercadoPago", message: "Será redirigido a MercadoPago para completar el pago de forma segura." });
          setTimeout(() => { window.location.href = result.checkout_url!; }, 1800);
        } else if (selectedGateway === "transfer") {
          setRedirect({ active: true, destination: "instrucciones de transferencia", message: "Pago registrado. Será redirigido a las instrucciones de transferencia." });
          setTimeout(() => router.push(`/checkout/pendiente?payment_id=${result.payment_id}`), 1800);
        } else {
          setRedirect({ active: true, destination: "confirmación", message: "¡Pago registrado correctamente! Redirigiendo a la confirmación." });
          setTimeout(() => router.push(`/checkout/exito?payment_id=${result.payment_id}`), 1800);
        }
      } else {
        const msg = result.error ?? "No se pudo procesar el pago.";
        setError(msg);
      }
    } catch (err) {
      setError(parsePaymentError(err));
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem", minHeight: "100vh" }}>
      {/* Back */}
      <Link href="/catalogo" style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", color: "var(--accent)", fontWeight: 600, marginBottom: "1.5rem", textDecoration: "none" }}>
        <ArrowLeft size={16} /> Seguir comprando
      </Link>

      <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "2rem" }}>Finalizar compra</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
        {/* Layout en 2 cols en desktop */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,340px)", gap: "2rem", alignItems: "start" }}>

          {/* Left: Payment form */}
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

              {loadingGateways ? (
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", color: "var(--text-muted)" }}>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Cargando métodos...
                </div>
              ) : gateways.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No hay métodos de pago disponibles.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                  {gateways.map((gw) => {
                    const meta = GATEWAY_META[gw.gateway as GatewayId];
                    const Icon = meta?.Icon ?? Banknote;
                    const active = selectedGateway === gw.gateway;
                    return (
                      <button
                        key={gw.gateway}
                        onClick={() => setSelectedGateway(gw.gateway as GatewayId)}
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
                          <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>{meta?.label ?? gw.gateway_display}</p>
                          <p style={{ margin: 0, fontSize: ".8rem", color: "var(--text-muted)" }}>{meta?.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Cuotas */}
              {isCardGateway && (
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

            {selectedGateway === "mercadopago" ? (
              <MPCardBrick
                amount={finalTotal}
                payerName={payerName}
                payerEmail={payerEmail}
                onSuccess={handleMPCardSuccess}
                onPaymentError={handleMPCardError}
              />
            ) : (
              <button
                onClick={handlePay}
                disabled={loading || !selectedGateway || gateways.length === 0}
                className="btn-primary"
                style={{ justifyContent: "center", padding: "1rem", fontSize: "1rem", opacity: loading || !selectedGateway ? .7 : 1 }}
              >
                {loading
                  ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />Procesando pago...</>
                  : <><CreditCard size={18} style={{ marginRight: 8 }} />Pagar {formatPrice(finalTotal)}</>
                }
              </button>
            )}
          </div>

          {/* Right: Order summary */}
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
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".9rem", color: "#22c55e" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: ".3rem" }}><Tag size={14} /> {appliedCoupon?.code}</span>
                  <span>− {formatPrice(discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem", borderTop: discount > 0 ? "1px solid var(--border)" : undefined, paddingTop: discount > 0 ? ".5rem" : undefined }}>
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </aside>
        </div>
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
