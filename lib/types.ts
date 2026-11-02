export type CategorySlug = "impressao-dtf" | "dtf-uv" | "camisetas-lisas" | "uniformes" | "estampas";

export type ProductKind = "metro" | "folha" | "vestuario" | "estampa";

export type ColorId = "amarelo" | "azul-marinho" | "branco" | "cinza-mescla" | "laranja" | "preto" | "verde" | "vermelho";

export type Size = "P" | "M" | "G" | "GG" | "G1" | "G2" | "G3";

export type GarmentShape = "camiseta" | "polo" | "moletom";

export interface Color {
  id: ColorId;
  name: string;
  hex: string;
  code: string;
}

export interface PriceTier {
  min: number;
  max: number | null;
  price: number;
}

interface BaseProduct {
  slug: string;
  name: string;
  short: string;
  description: string[];
  category: CategorySlug;
  kind: ProductKind;
  images: string[];
  badge?: string;
  /** peso de 1 unidade em kg, usado no cálculo de frete */
  weight: number;
  bestseller?: boolean;
}

export interface MetroProduct extends BaseProduct {
  kind: "metro";
  /** preço por metragem, índice 0 = 1 metro */
  prices: number[];
  needsArt: true;
  width?: string;
}

export interface SheetProduct extends BaseProduct {
  kind: "folha";
  sizes: { id: "A4" | "A3"; label: string; price: number }[];
  needsArt: true;
}

export interface GarmentProduct extends BaseProduct {
  kind: "vestuario";
  shape: GarmentShape;
  skuPrefix: string;
  colors: ColorId[];
  sizes: Size[];
  tiers: PriceTier[];
  features: { title: string; text: string }[];
}

export interface DesignProduct extends BaseProduct {
  kind: "estampa";
  /** arte publicada da estampa e a cor de fundo do quadro */
  art: string;
  artBg: string;
  sizes: { id: "A4" | "A3"; label: string; price: number }[];
}


export type Product = MetroProduct | SheetProduct | GarmentProduct | DesignProduct;

export interface ArtFile {
  id: string;
  name: string;
  size: number;
  type: string;
  /** miniatura em data URL (só para imagens pequenas) */
  preview?: string;
}

export interface CartLine {
  id: string;
  slug: string;
  /** metros (metro), tamanho A3/A4 (folha/estampa) ou SKU (vestuario) */
  option: string;
  qty: number;
  arts?: ArtFile[];
  note?: string;
}

export type PaymentMethod = "pix" | "cartao" | "boleto";

export type OrderStatus = "aguardando" | "pago" | "producao" | "enviado" | "entregue" | "cancelado";

export interface ShippingQuote {
  id: string;
  carrier: string;
  service: string;
  price: number;
  days: string;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  uf: string;
}

export interface OrderLine {
  slug: string;
  name: string;
  option: string;
  optionLabel: string;
  qty: number;
  unit: number;
  arts?: ArtFile[];
  note?: string;
}

export interface Order {
  code: string;
  createdAt: string;
  customer: { name: string; email: string; phone: string; doc: string; company?: string };
  address: Address;
  lines: OrderLine[];
  shipping: ShippingQuote;
  subtotal: number;
  total: number;
  payment: { method: PaymentMethod; installments?: number; cardLast4?: string; expiresAt?: string; paidAt?: string; boletoLine?: string; boletoDue?: string };
  status: OrderStatus;
  bling?: { number: string; nfe?: string; syncedAt: string };
  tracking?: string;
  history: { at: string; status: OrderStatus; text: string }[];
}

export interface Session {
  email: string;
  name: string;
  company?: string;
  phone: string;
  doc: string;
  avatar: string;
  address: Address;
}

export type IntegrationId = "bling" | "frenet" | "mercadopago" | "meta" | "ga4";

export interface IntegrationLog {
  id: string;
  at: string;
  integration: IntegrationId;
  level: "ok" | "aviso";
  text: string;
}

export interface TrackEvent {
  id: string;
  at: string;
  name: "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";
  eventId: string;
  value?: number;
  browser: boolean;
  server: boolean;
}
