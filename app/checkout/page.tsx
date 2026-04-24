"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { initiatePayment, getEnabledGateways, type GatewayConfig, type GatewayId } from "@/lib/payments";
import { ArrowLeft, CreditCard, Landmark, Smartphone, Banknote, ShoppingCart, Loader2 } from "lucide-react";

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(n);
}

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

  useEffect(() => {
    closeCart();
    getEnabledGateways().then((list) => {
      setGateways(list);
      if (list.length > 0) setSelectedGateway(list[0].gateway as GatewayId);
    }).finally(() => setLoadingGateways(false));
  }, [closeCart]);

  const isCardGateway = selectedGateway === "card" || selectedGateway === "mercadopago";

  async function handlePay() {
    if (!selectedGateway || items.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await initiatePayment({
        gateway: selectedGateway,
        amount: total,
        payer_name: payerName,
        payer_email: payerEmail,
        payer_phone: payerPhone,
        installments: isCardGateway ? installments : 1,
        cart_items: items.map((i) => ({
          product_id: i.product.id,
          product_name: i.product.name,
          quantity: i.quantity,
          unit_price: i.unitPrice,
        })),
      });

      if (result.success) {
        if (result.checkout_url) {
          // MercadoPago → redirigir a MP
          clearCart();
          window.location.href = result.checkout_url;
        } else if (selectedGateway === "transfer") {
          // Transferencia → mostrar datos bancarios
          clearCart();
          router.push(`/checkout/pendiente?payment_id=${result.payment_id}`);
        } else {
          // Card / debit (posnet) → confirmación directa
          clearCart();
          router.push(`/checkout/exito?payment_id=${result.payment_id}`);
        }
      } else {
        setError(result.error ?? "Error al procesar el pago. Intente nuevamente.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
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
                      {formatPrice(total / installments)} × {installments} cuotas
                    </p>
                  )}
                </div>
              )}
            </section>

            {error && (
              <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, padding: "1rem", color: "#ef4444", fontSize: ".9rem" }}>
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading || !selectedGateway || gateways.length === 0}
              className="btn-primary"
              style={{ justifyContent: "center", padding: "1rem", fontSize: "1rem", opacity: loading ? .7 : 1 }}
            >
              {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite", marginRight: 8 }} />Procesando...</> : <><CreditCard size={18} style={{ marginRight: 8 }} />Pagar {formatPrice(total)}</>}
            </button>
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
            <div style={{ borderTop: "1px solid var(--border)", marginTop: "1rem", paddingTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: "1.1rem" }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
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
