import { apiFetch } from "./api";

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "techstore";

export interface CheckoutItem {
  product: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface CheckoutPayload {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_type: "shipping" | "pickup";
  payment_method: "cash" | "transfer" | "card" | "mercadopago";
  items: CheckoutItem[];
  coupon_code?: string;
  notes?: string;
  payer_name?: string;
  payer_email?: string;
  installments?: number;
  shipping_street?: string;
  shipping_city?: string;
  shipping_province?: string;
  shipping_postal_code?: string;
}

export interface CheckoutResponse {
  order_id: string;
  order_number: string;
  payment_id: string;
  payment_method: string;
  status: string;
  checkout_url: string | null;
  total: string;
}

export interface PrepareCheckoutPayload {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_type: "shipping" | "pickup";
  items: CheckoutItem[];
  coupon_code?: string;
  notes?: string;
  shipping_street?: string;
  shipping_city?: string;
  shipping_province?: string;
  shipping_postal_code?: string;
}

export interface PrepareCheckoutResponse {
  order_id: string;
  order_number: string;
  total: string;
}

export async function prepareCheckout(
  payload: PrepareCheckoutPayload,
  tenantSlug?: string
): Promise<PrepareCheckoutResponse> {
  const slug = tenantSlug ?? DEFAULT_TENANT;
  return apiFetch<PrepareCheckoutResponse>("/checkout/prepare/", {
    method: "POST",
    body: JSON.stringify(payload),
    tenantSlug: slug,
  });
}

export async function checkout(
  payload: CheckoutPayload,
  tenantSlug?: string
): Promise<CheckoutResponse> {
  const slug = tenantSlug ?? DEFAULT_TENANT;
  return apiFetch<CheckoutResponse>("/checkout/", {
    method: "POST",
    body: JSON.stringify(payload),
    tenantSlug: slug,
  });
}

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
  coupon_code?: string;
  delivery_type?: "shipping" | "pickup";
}

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discount_type?: "percentage" | "fixed";
  value?: string;
  discount_amount?: string;
  message: string;
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

export interface MPCardPaymentPayload {
  amount: number;
  card_token: string;
  payment_method_id: string;
  installments?: number;
  payer_name?: string;
  payer_email?: string;
  order_id?: string;
}

export async function getMPPublicKey(tenantSlug?: string): Promise<string> {
  const slug = tenantSlug ?? DEFAULT_TENANT;
  const res = await apiFetch<{ public_key: string }>("/payments/mp-public-key/", { tenantSlug: slug });
  return res.public_key;
}

export async function initiateMPCardPayment(
  payload: MPCardPaymentPayload,
  tenantSlug?: string
): Promise<InitiatePaymentResponse> {
  const slug = tenantSlug ?? DEFAULT_TENANT;
  return apiFetch<InitiatePaymentResponse>("/payments/mp-card/", {
    method: "POST",
    body: JSON.stringify(payload),
    tenantSlug: slug,
  });
}

export async function validateCoupon(
  code: string,
  amount: number,
  tenantSlug?: string
): Promise<CouponValidationResult> {
  const slug = tenantSlug ?? DEFAULT_TENANT;
  const params = new URLSearchParams({ code: code.trim().toUpperCase(), amount: String(amount) });
  return apiFetch<CouponValidationResult>(`/coupons/validate/?${params}`, { tenantSlug: slug });
}
