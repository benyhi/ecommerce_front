// ─── API Types (match Django REST backend) ────────────────────────────────

export interface Option {
  id: string;
  name: string;
  price: string;
  active: boolean;
  order: number;
  /** Optional image to represent this option (e.g. color variant) */
  image_url?: string | null;
  /** Optional HEX for swatch rendering */
  swatch_hex?: string | null;
}

export interface OptionGroup {
  id: string;
  name: string;
  required: boolean;
  max_choices: number;
  order: number;
  options: Option[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  /** Stock disponible de la variante principal */
  stock?: number;
  /** Optional reference price for discounts */
  compare_at_price?: string;
  active: boolean;
  order: number;
  image_filename: string | null;
  image_url: string | null;
  /** Brand name for filtering/sorting */
  brand?: string;
  /** Mark as offer/promotional item */
  is_offer?: boolean;
  /** Optional image gallery for carousel */
  images?: string[];
  /** Optional option groups attached directly to the product */
  option_groups?: OptionGroup[];
  category?: string | CategoryBasic | null;
  category_detail?: CategoryBasic | null;
  subcategory?: string | SubcategoryBasic | null;
  subcategory_detail?: SubcategoryBasic | null;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value: string;
  order: number;
}

export interface ProductBadge {
  id: string;
  title: string;
  description: string;
  icon: "truck" | "shield" | "box" | "check" | "star" | "zap";
  active: boolean;
  order: number;
}

export interface ProductReadOnly extends Product {
  category: CategoryBasic;
  subcategory: SubcategoryBasic | null;
  option_groups: OptionGroup[];
  attributes: ProductAttribute[];
}

export interface CategoryBasic {
  id: string;
  name: string;
  order: number;
}

export interface SubcategoryBasic {
  id: string;
  name: string;
  order: number;
  category: CategoryBasic;
}

export interface Subcategory {
  id: string;
  category: string;
  category_detail: CategoryBasic;
  name: string;
  order: number;
  active: boolean;
  products: Product[];
}

export interface Category {
  id: string;
  name: string;
  active: boolean;
  order: number;
  products: Product[];
  subcategories?: Subcategory[];
}

// ─── Auth / Tenant ───────────────────────────────────────────────────────

export interface TenantBasic {
  id: string;
  slug: string;
  name: string;
}

// ─── Brand / Tenant Personalización ─────────────────────────────────────

/** Configuración visual de la marca, devuelta por GET /api/tenant/branding/ */
export interface BrandConfig {
  /** Nombre visible del local */
  store_name: string;
  /** Nombre comercial/brand para textos UI */
  brand_name: string;
  /** URL absoluta o relativa del logo (puede ser null para usar el logo por defecto) */
  logo_url: string | null;
  /** Color primario (hex, ej: "#6366f1"). Mapea a --accent */
  color_primary: string;
  /** Color secundario (hex, ej: "#06b6d4"). Mapea a --accent2 */
  color_secondary: string;
  /** Color de fondo general (hex, ej: "#ffffff"). Mapea a --background */
  color_background: string;
  /** Color del texto sobre el fondo primario (ej: "#ffffff") */
  color_primary_text: string;
  /** Descripción corta para footer/identidad */
  tagline: string;
  /** Datos de contacto de la empresa */
  contact: BrandContactConfig;
  /** Metadata SEO por tenant */
  seo: BrandSeoConfig;
  /** Costo de envío a domicilio (0 = gratis) */
  shipping_cost?: number;
}

export interface BrandContactConfig {
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  business_hours: string;
  map_embed_url: string;
  map_title: string;
}

export interface BrandSeoConfig {
  title: string;
  description: string;
  keywords: string;
  seo_image?: string;
}

export interface User {
  id: string; // UUID
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "admin" | "employee" | "editor" | "read" | "customer";
  tenant: TenantBasic;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

// ─── Site / Homepage ─────────────────────────────────────────────────────────

export interface CarouselBannerPublic {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  link_url: string;
  button_text: string;
  order: number;
  active: boolean;
}

export interface FeaturedProductPublic {
  id: string;
  product: string;
  product_detail: ProductReadOnly | null;
  order: number;
  active: boolean;
}

// ─── Site / Posts ────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  published_at: string | null;
  active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

// ─── Cart ────────────────────────────────────────────────────────────────

export interface SelectedOption {
  groupId: string;
  groupName: string;
  option: Option;
}

export interface CartItem {
  cartItemId: string; // unique key (productId + serialized options)
  product: ProductReadOnly;
  quantity: number;
  selectedOptions: SelectedOption[];
  unitPrice: number; // base product price + selected options
}
