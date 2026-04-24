import { apiFetch } from "./api";

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "techstore";

export type GatewayId = "mercadopago" | "naranja_x" | "transfer" | "card" | "debit";

export interface GatewayConfig {
  id: string;
  gateway: GatewayId;
  gateway_display: string;
  is_enabled: boolean;
  config: Record<string, string>;
}

export interface CartItemPayload {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface InitiatePaymentPayload {
  gateway: GatewayId;
  amount: number;
  payer_name?: string;
  payer_email?: string;
  payer_phone?: string;
  installments?: number;
  order_id?: string;
  cart_items?: CartItemPayload[];
  notes?: string;
}

export interface InitiatePaymentResponse {
  payment_id: string;
  status: string;
  gateway: string;
  checkout_url: string | null;
  metadata: Record<string, unknown>;
  success: boolean;
  error?: string;
}

export interface PaymentStatus {
  payment_id: string;
  status: string;
  gateway: string;
  amount: string;
  checkout_url: string | null;
  gateway_response: Record<string, string>;
}

export async function getEnabledGateways(tenantSlug?: string): Promise<GatewayConfig[]> {
  try {
    const slug = tenantSlug ?? DEFAULT_TENANT;
    const res = await apiFetch<{ results: GatewayConfig[] }>(
      "/payments/gateways/",
      { tenantSlug: slug }
    );
    return res.results ?? [];
  } catch {
    return [];
  }
}

export async function initiatePayment(
  payload: InitiatePaymentPayload,
  tenantSlug?: string
): Promise<InitiatePaymentResponse> {
  const slug = tenantSlug ?? DEFAULT_TENANT;
  return apiFetch<InitiatePaymentResponse>("/payments/initiate/", {
    method: "POST",
    body: JSON.stringify(payload),
    tenantSlug: slug,
  });
}

export async function getPaymentStatus(
  paymentId: string,
  tenantSlug?: string
): Promise<PaymentStatus> {
  const slug = tenantSlug ?? DEFAULT_TENANT;
  return apiFetch<PaymentStatus>(`/payments/${paymentId}/status/`, { tenantSlug: slug });
}
