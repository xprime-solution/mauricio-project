"use client";

import { useSyncExternalStore } from "react";
import { allGarmentSkus, garmentBySku } from "./catalog";
import { addBusinessDays } from "./format";
import { ADMIN_LOGIN, CUSTOMER_LOGIN, PEOPLE, cnpjFrom, personByEmail } from "./people";
import { priceLines } from "./pricing";
import { quoteShipping } from "./shipping";
import type {
  Address,
  ArtFile,
  CartLine,
  IntegrationId,
  IntegrationLog,
  Order,
  OrderStatus,
  PaymentMethod,
  Session,
  ShippingQuote,
  TrackEvent,
} from "./types";

const KEY = "dtf4u-loja:v2";
const PIX_MINUTES = 30;

export interface Account {
  email: string;
  password: string;
  session: Session;
}

export interface State {
  ready: boolean;
  cart: CartLine[];
  session: Session | null;
  admin: boolean;
  accounts: Account[];
  orders: Order[];
  stock: Record<string, number>;
  logs: IntegrationLog[];
  events: TrackEvent[];
  seq: number;
  lastSync: Record<IntegrationId, string>;
}

const EMPTY: State = {
  ready: false,
  cart: [],
  session: null,
  admin: false,
  accounts: [],
  orders: [],
  stock: {},
  logs: [],
  events: [],
  seq: 0,
  lastSync: { bling: "", frenet: "", mercadopago: "", meta: "", ga4: "" },
};

/* ---------- seed ---------- */

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export const uid = () => Math.random().toString(36).slice(2, 10);

const sessionFor = (i: number): Session => {
  const p = PEOPLE[i];
  return { email: p.email, name: p.name, company: p.company, phone: p.phone, doc: cnpjFrom(String(31452870 + i * 7919)), avatar: p.avatar, address: p.address };
};

type SeedLine = [slug: string, option: string, qty: number];
const art = (name: string, kb: number): ArtFile => ({ id: uid(), name, size: kb * 1024, type: name.endsWith(".pdf") ? "application/pdf" : "image/png" });

function seedOrders(now: number): { orders: Order[]; events: TrackEvent[]; logs: IntegrationLog[] } {
  const specs: {
    code: number;
    who: number;
    hours: number;
    lines: SeedLine[];
    arts?: Record<string, ArtFile[]>;
    status: OrderStatus;
    method: PaymentMethod;
    ship: string;
    browser?: boolean;
  }[] = [
    { code: 10461, who: 1, hours: 290, lines: [["camiseta-lisa-premium", "CAM-PRT-M", 10], ["camiseta-lisa-premium", "CAM-PRT-G", 12], ["camiseta-lisa-premium", "CAM-PRT-GG", 8], ["dtf-textil-60cm", "5", 1]], arts: { "dtf-textil-60cm": [art("teixeira-uniformes-logo-peito.png", 2840), art("teixeira-uniformes-costas.png", 5120)] }, status: "entregue", method: "pix", ship: "jadlog" },
    { code: 10462, who: 6, hours: 266, lines: [["dtf-uv", "3", 1], ["folha-dtf-uv", "A3", 2]], arts: { "dtf-uv": [art("jp-brindes-garrafas-lote-outubro.pdf", 8420)], "folha-dtf-uv": [art("jp-brindes-adesivos-cadernos.png", 3310)] }, status: "entregue", method: "cartao", ship: "sedex" },
    { code: 10463, who: 2, hours: 240, lines: [["dtf-textil", "4", 1], ["camiseta-lisa-premium", "CAM-BRA-M", 6], ["camiseta-lisa-premium", "CAM-BRA-G", 6]], arts: { "dtf-textil": [art("rocha-personalizados-formatura.png", 6210)] }, status: "entregue", method: "boleto", ship: "pac", browser: false },
    { code: 10464, who: 0, hours: 216, lines: [["dtf-textil-60cm", "3", 1], ["camiseta-lisa-premium", "CAM-AZM-P", 4], ["camiseta-lisa-premium", "CAM-AZM-M", 8], ["camiseta-lisa-premium", "CAM-AZM-G", 8], ["camiseta-lisa-premium", "CAM-AZM-GG", 4]], arts: { "dtf-textil-60cm": [art("estudio-mare-colecao-verao-frente.png", 4380), art("estudio-mare-colecao-verao-costas.png", 4950)] }, status: "entregue", method: "pix", ship: "jadlog" },
    { code: 10465, who: 5, hours: 190, lines: [["camiseta-dry-fit", "DRY-BRA-M", 10], ["camiseta-dry-fit", "DRY-BRA-G", 10], ["camiseta-dry-fit", "DRY-BRA-GG", 5], ["dtf-textil-60cm", "2", 1]], arts: { "dtf-textil-60cm": [art("arena-fut-sete-numeros-1-a-25.pdf", 9870)] }, status: "enviado", method: "cartao", ship: "pac" },
    { code: 10466, who: 8, hours: 168, lines: [["camiseta-lisa-premium", "CAM-PRT-P", 3], ["camiseta-lisa-premium", "CAM-PRT-M", 5], ["camiseta-lisa-premium", "CAM-PRT-G", 4], ["estampa-3", "A4", 12]], status: "entregue", method: "pix", ship: "retirada" },
    { code: 10467, who: 3, hours: 150, lines: [["moletom-canguru-premium", "MOL-AZM-M", 6], ["moletom-canguru-premium", "MOL-AZM-G", 6], ["moletom-canguru-premium", "MOL-AZM-GG", 3], ["estampa-1", "A3", 15], ["dtf-textil-60cm", "2", 1]], arts: { "dtf-textil-60cm": [art("sul-surf-co-logo-manga.png", 1960)] }, status: "enviado", method: "pix", ship: "sedex", browser: false },
    { code: 10468, who: 10, hours: 120, lines: [["dtf-uv", "2", 1], ["camiseta-lisa-premium", "CAM-BRA-P", 5], ["camiseta-lisa-premium", "CAM-BRA-M", 5]], arts: { "dtf-uv": [art("costa-moda-praia-tags-copos.png", 2770)] }, status: "enviado", method: "cartao", ship: "sedex" },
    { code: 10469, who: 4, hours: 96, lines: [["folha-dtf-textil", "A3", 4], ["camiseta-lisa-premium", "CAM-VRM-M", 2], ["camiseta-lisa-premium", "CAM-VRM-G", 2]], arts: { "folha-dtf-textil": [art("atelie-lopes-bordado-floral.png", 3640)] }, status: "producao", method: "pix", ship: "pac" },
    { code: 10470, who: 11, hours: 72, lines: [["camiseta-dry-fit", "DRY-PRT-M", 12], ["camiseta-dry-fit", "DRY-PRT-G", 12], ["camiseta-dry-fit", "DRY-PRT-GG", 6], ["camiseta-dry-fit", "DRY-PRT-G1", 2], ["dtf-textil-60cm", "4", 1]], arts: { "dtf-textil-60cm": [art("nunes-academia-equipe-2026.png", 7310)] }, status: "producao", method: "boleto", ship: "jadlog" },
    { code: 10471, who: 9, hours: 50, lines: [["dtf-textil", "10", 1]], arts: { "dtf-textil": [art("ramos-estamparia-lote-semana-44.pdf", 18240)] }, status: "producao", method: "pix", ship: "pac", browser: false },
    { code: 10472, who: 0, hours: 30, lines: [["dtf-textil-60cm", "6", 1], ["camiseta-lisa-premium", "CAM-BRA-P", 6], ["camiseta-lisa-premium", "CAM-BRA-M", 12], ["camiseta-lisa-premium", "CAM-BRA-G", 12], ["camiseta-lisa-premium", "CAM-BRA-GG", 6]], arts: { "dtf-textil-60cm": [art("estudio-mare-drop-novembro.png", 6880)] }, status: "pago", method: "cartao", ship: "jadlog" },
    { code: 10473, who: 7, hours: 20, lines: [["camisa-polo", "POL-AZM-M", 8], ["camisa-polo", "POL-AZM-G", 8], ["camisa-polo", "POL-AZM-GG", 4], ["folha-dtf-textil", "A4", 20]], arts: { "folha-dtf-textil": [art("almeida-eventos-logo-peito.png", 1250)] }, status: "pago", method: "pix", ship: "retirada" },
    { code: 10474, who: 12, hours: 6, lines: [["dtf-uv", "5", 1]], arts: { "dtf-uv": [art("lima-grafica-brindes-fim-de-ano.pdf", 12650)] }, status: "pago", method: "pix", ship: "jadlog" },
    { code: 10475, who: 13, hours: 3, lines: [["camiseta-lisa-premium", "CAM-PRT-M", 4], ["camiseta-lisa-premium", "CAM-PRT-G", 4], ["dtf-textil-60cm", "1", 1]], arts: { "dtf-textil-60cm": [art("pires-sports-escudo.png", 980)] }, status: "cancelado", method: "pix", ship: "pac" },
    { code: 10476, who: 6, hours: 0.15, lines: [["estampa-4", "A4", 10], ["folha-dtf-uv", "A4", 5]], arts: { "folha-dtf-uv": [art("jp-brindes-adesivos-tigre.png", 2140)] }, status: "aguardando", method: "pix", ship: "sedex" },
  ];

  const orders: Order[] = [];
  const events: TrackEvent[] = [];
  const logs: IntegrationLog[] = [];
  let blingNo = 4401;
  let nfe = 1270;
  const flow: OrderStatus[] = ["aguardando", "pago", "producao", "enviado", "entregue"];

  for (const s of specs) {
    const person = PEOPLE[s.who];
    const created = now - s.hours * 3600_000;
    const cart: CartLine[] = s.lines.map(([slug, option, qty]) => ({ id: uid(), slug, option, qty, arts: s.arts?.[slug] }));
    const priced = priceLines(cart);
    const weight = priced.reduce((a, p) => a + p.weight, 0);
    const quotes = quoteShipping(person.address.cep, weight) ?? [];
    const shipping = quotes.find((q) => q.id === s.ship) ?? quotes[0];
    const subtotal = Math.round(priced.reduce((a, p) => a + p.total, 0) * 100) / 100;
    const at = (h: number) => new Date(created + h * 3600_000).toISOString();
    const history: Order["history"] = [{ at: at(0), status: "aguardando", text: s.method === "boleto" ? "Boleto gerado" : s.method === "pix" ? "Pix gerado" : "Pedido recebido" }];
    const reached = s.status === "cancelado" ? 0 : flow.indexOf(s.status);
    const steps: [OrderStatus, number, string][] = [
      ["pago", s.method === "boleto" ? 20 : 0.1, "Pagamento aprovado pelo Mercado Pago"],
      ["producao", s.method === "boleto" ? 22 : 2, "Arte conferida e impressão iniciada"],
      ["enviado", s.method === "boleto" ? 46 : 26, shipping.id === "retirada" ? "Pronto para retirada em Itajaí" : `Enviado por ${shipping.carrier} ${shipping.service}`],
      ["entregue", 96, shipping.id === "retirada" ? "Retirado na loja" : "Entregue ao destinatário"],
    ];
    for (const [st, h, text] of steps) if (flow.indexOf(st) <= reached && created + h * 3600_000 <= now) history.push({ at: at(h), status: st, text });
    if (s.status === "cancelado") history.push({ at: at(0.5), status: "cancelado", text: "Pix não pago em 30 minutos. Pedido cancelado e estoque devolvido" });

    const paid = reached >= 1;
    const order: Order = {
      code: String(s.code),
      createdAt: at(0),
      customer: { name: person.name, email: person.email, phone: person.phone, doc: sessionFor(s.who).doc, company: person.company },
      address: person.address,
      lines: priced.map((p) => ({ slug: p.product.slug, name: p.product.name, option: p.line.option, optionLabel: p.label, qty: p.line.qty, unit: p.unit, arts: p.line.arts })),
      shipping,
      subtotal,
      total: Math.round((subtotal + shipping.price) * 100) / 100,
      payment: {
        method: s.method,
        installments: s.method === "cartao" ? (subtotal > 600 ? 3 : 1) : undefined,
        cardLast4: s.method === "cartao" ? String(1000 + (hash(person.email) % 9000)) : undefined,
        expiresAt: s.method === "pix" ? at(PIX_MINUTES / 60) : undefined,
        paidAt: paid ? history.find((h) => h.status === "pago")?.at : undefined,
        boletoLine: s.method === "boleto" ? boletoLine(String(s.code), subtotal + shipping.price) : undefined,
        boletoDue: s.method === "boleto" ? addBusinessDays(new Date(created), 3).toISOString() : undefined,
      },
      status: s.status,
      history,
    };
    if (paid) {
      const syncedAt = new Date(created + (s.method === "boleto" ? 20.05 : 0.15) * 3600_000).toISOString();
      order.bling = { number: String(blingNo++), nfe: String(nfe++).padStart(6, "0"), syncedAt };
      logs.push({ id: uid(), at: syncedAt, integration: "mercadopago", level: "ok", text: `Pagamento do pedido #${s.code} aprovado (${s.method === "pix" ? "Pix" : s.method === "boleto" ? "boleto" : "cartão"}) e confirmado na loja` });
      logs.push({ id: uid(), at: syncedAt, integration: "bling", level: "ok", text: `Pedido #${s.code} criado no Bling como pedido de venda ${order.bling.number}` });
      logs.push({ id: uid(), at: new Date(created + 2.2 * 3600_000).toISOString(), integration: "bling", level: "ok", text: `NF-e ${order.bling.nfe} emitida para o pedido #${s.code}` });
      events.push({ id: uid(), at: syncedAt, name: "Purchase", eventId: `ord-${s.code}`, value: order.total, browser: s.browser !== false, server: true });
      logs.push({ id: uid(), at: syncedAt, integration: "meta", level: "ok", text: s.browser === false ? `Compra #${s.code} recebida só pelo servidor (navegador bloqueou o Pixel)` : `Compra #${s.code} recebida pelo navegador e pelo servidor, contada 1 vez` });
    }
    if (reached >= 3 && shipping.id !== "retirada") {
      order.tracking = shipping.carrier === "Correios" ? `Q${String.fromCharCode(65 + (s.code % 26))}${String(hash(order.code) % 1e9).padStart(9, "0")}BR` : String(10 ** 13 + (hash(order.code) % 9e12));
      logs.push({ id: uid(), at: history.find((h) => h.status === "enviado")!.at, integration: "frenet", level: "ok", text: `Etiqueta ${shipping.carrier} ${shipping.service} gerada para o pedido #${s.code}` });
    }
    if (s.status === "cancelado") {
      logs.push({ id: uid(), at: at(0.5), integration: "mercadopago", level: "aviso", text: `Pix do pedido #${s.code} venceu sem pagamento. Pedido cancelado e estoque devolvido` });
    }
    orders.push(order);
  }
  return { orders: orders.reverse(), events, logs };
}

export function boletoLine(code: string, total: number) {
  const v = String(Math.round(total * 100)).padStart(10, "0");
  const base = `32390${code}0${String(hash(code)).padStart(10, "0").slice(0, 10)}`;
  const digits = (base + "1".repeat(30)).slice(0, 37) + v;
  const p = digits.padEnd(47, "0");
  return `${p.slice(0, 5)}.${p.slice(5, 10)} ${p.slice(10, 15)}.${p.slice(15, 21)} ${p.slice(21, 26)}.${p.slice(26, 32)} ${p.slice(32, 33)} ${p.slice(33)}`;
}

function seedStock() {
  const stock: Record<string, number> = {};
  for (const { sku } of allGarmentSkus()) {
    const h = hash(sku);
    stock[sku] = 8 + (h % 70);
  }
  for (const sku of ["CAM-AMA-G3", "CAM-LAR-G2", "MOL-VRM-P", "DRY-CIN-G1"]) stock[sku] = 0;
  for (const sku of ["POL-BRA-GG", "CAM-VRD-G3", "MOL-BRA-G3"]) stock[sku] = 3;
  return stock;
}

function seed(): State {
  const now = Date.now();
  const { orders, events, logs } = seedOrders(now);
  const iso = (minAgo: number) => new Date(now - minAgo * 60000).toISOString();
  logs.push(
    { id: uid(), at: iso(4), integration: "bling", level: "ok", text: `Estoque sincronizado: ${allGarmentSkus().length} SKUs conferidos, 0 divergências` },
    { id: uid(), at: iso(11), integration: "frenet", level: "ok", text: "Cotação para CEP 88330-075: 4 opções devolvidas" },
    { id: uid(), at: iso(18), integration: "ga4", level: "ok", text: "Funil do dia enviado: 214 visualizações de produto, 37 adições ao carrinho" },
    { id: uid(), at: iso(9), integration: "mercadopago", level: "ok", text: "Pix do pedido #10476 gerado, vence em 30 minutos" },
  );
  logs.sort((a, b) => b.at.localeCompare(a.at));
  for (let i = 0; i < 6; i++) {
    events.push({ id: uid(), at: iso(5 + i * 13), name: i % 2 ? "AddToCart" : "ViewContent", eventId: `ev-${uid()}`, browser: i !== 3, server: true });
  }
  events.sort((a, b) => b.at.localeCompare(a.at));
  const accounts: Account[] = [{ email: CUSTOMER_LOGIN.email, password: CUSTOMER_LOGIN.password, session: sessionFor(0) }];
  return {
    ready: true,
    cart: [],
    session: null,
    admin: false,
    accounts,
    orders,
    stock: seedStock(),
    logs,
    events,
    seq: 10477,
    lastSync: { bling: iso(4), frenet: iso(11), mercadopago: iso(9), meta: iso(6), ga4: iso(18) },
  };
}

/* ---------- external store ---------- */

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed && parsed.seq) {
        state = { ...EMPTY, ...parsed, ready: true };
        expirePix();
        return;
      }
    }
  } catch {
    /* armazenamento indisponível: segue com os dados iniciais */
  }
  state = seed();
  persist();
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* sem espaço ou modo privado */
  }
}

function set(fn: (s: State) => State) {
  load();
  state = fn(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY && e.newValue) {
      try {
        state = { ...EMPTY, ...(JSON.parse(e.newValue) as State), ready: true };
        cb();
      } catch {
        /* ignora */
      }
    }
  };
  window.addEventListener("storage", onStorage);
  if (!state.ready) queueMicrotask(cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStore(): State {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return state;
    },
    () => EMPTY,
  );
}

export const getState = () => {
  load();
  return state;
};

/* ---------- ações ---------- */

const log = (integration: IntegrationId, text: string, level: IntegrationLog["level"] = "ok"): IntegrationLog => ({
  id: uid(),
  at: new Date().toISOString(),
  integration,
  level,
  text,
});

export function track(name: TrackEvent["name"], value?: number) {
  set((s) => ({ ...s, events: [{ id: uid(), at: new Date().toISOString(), name, eventId: `ev-${uid()}`, value, browser: true, server: true }, ...s.events].slice(0, 200) }));
}

export function addToCart(lines: Omit<CartLine, "id">[]) {
  set((s) => {
    const cart = [...s.cart];
    for (const l of lines) {
      const same = cart.findIndex((c) => c.slug === l.slug && c.option === l.option && !c.arts?.length && !l.arts?.length);
      if (same >= 0) cart[same] = { ...cart[same], qty: cart[same].qty + l.qty };
      else cart.push({ ...l, id: uid() });
    }
    return { ...s, cart };
  });
  const value = priceLines(lines.map((l) => ({ ...l, id: "x" }))).reduce((a, p) => a + p.total, 0);
  track("AddToCart", Math.round(value * 100) / 100);
}

export function setQty(id: string, qty: number) {
  set((s) => ({ ...s, cart: s.cart.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(999, qty)) } : l)) }));
}

export function removeLine(id: string) {
  set((s) => ({ ...s, cart: s.cart.filter((l) => l.id !== id) }));
}

export function clearCart() {
  set((s) => ({ ...s, cart: [] }));
}

export function login(email: string, password: string): string | null {
  const s = getState();
  const acc = s.accounts.find((a) => a.email === email.trim().toLowerCase());
  if (!acc) return "Não encontramos uma conta com esse e-mail.";
  if (acc.password !== password) return "Senha incorreta. Confira e tente de novo.";
  set((st) => ({ ...st, session: acc.session }));
  return null;
}

export function register(data: { name: string; email: string; password: string; phone: string; doc: string; company?: string }): string | null {
  const s = getState();
  const email = data.email.trim().toLowerCase();
  if (s.accounts.some((a) => a.email === email)) return "Já existe uma conta com esse e-mail. Entre com a sua senha.";
  const known = personByEmail(email);
  const session: Session = {
    email,
    name: data.name.trim(),
    company: data.company?.trim() || undefined,
    phone: data.phone,
    doc: data.doc,
    avatar: known?.avatar ?? "",
    address: { cep: "", street: "", number: "", complement: "", district: "", city: "", uf: "" },
  };
  set((st) => ({ ...st, accounts: [...st.accounts, { email, password: data.password, session }], session }));
  return null;
}

export function logout() {
  set((s) => ({ ...s, session: null }));
}

export function adminLogin(email: string, password: string): string | null {
  if (email.trim().toLowerCase() !== ADMIN_LOGIN.email) return "Esse e-mail não tem acesso ao painel da loja.";
  if (password !== ADMIN_LOGIN.password) return "Senha incorreta. Confira e tente de novo.";
  set((s) => ({ ...s, admin: true }));
  return null;
}

export function adminLogout() {
  set((s) => ({ ...s, admin: false }));
}

export interface CheckoutInput {
  customer: Order["customer"];
  address: Address;
  shipping: ShippingQuote;
  method: PaymentMethod;
  installments?: number;
  cardLast4?: string;
}

export function placeOrder(input: CheckoutInput): Order {
  const s = getState();
  const priced = priceLines(s.cart);
  const subtotal = Math.round(priced.reduce((a, p) => a + p.total, 0) * 100) / 100;
  const total = Math.round((subtotal + input.shipping.price) * 100) / 100;
  const now = new Date();
  const code = String(s.seq);
  const order: Order = {
    code,
    createdAt: now.toISOString(),
    customer: input.customer,
    address: input.address,
    lines: priced.map((p) => ({ slug: p.product.slug, name: p.product.name, option: p.line.option, optionLabel: p.label, qty: p.line.qty, unit: p.unit, arts: p.line.arts, note: p.line.note })),
    shipping: input.shipping,
    subtotal,
    total,
    payment: {
      method: input.method,
      installments: input.installments,
      cardLast4: input.cardLast4,
      expiresAt: input.method === "pix" ? new Date(now.getTime() + PIX_MINUTES * 60000).toISOString() : undefined,
      boletoLine: input.method === "boleto" ? boletoLine(code, total) : undefined,
      boletoDue: input.method === "boleto" ? addBusinessDays(now, 3).toISOString() : undefined,
    },
    status: "aguardando",
    history: [{ at: now.toISOString(), status: "aguardando", text: input.method === "pix" ? "Pix gerado" : input.method === "boleto" ? "Boleto gerado" : "Pedido recebido" }],
  };
  set((st) => {
    const stock = { ...st.stock };
    for (const l of order.lines) if (garmentBySku(l.option)) stock[l.option] = Math.max(0, (stock[l.option] ?? 0) - l.qty);
    const logs = [
      log("mercadopago", input.method === "pix" ? `Pix do pedido #${code} gerado, vence em 30 minutos` : input.method === "boleto" ? `Boleto do pedido #${code} registrado` : `Cartão do pedido #${code} enviado para análise`),
      ...st.logs,
    ];
    // o primeiro pedido salva o endereço na conta de quem está logado
    let session = st.session;
    let accounts = st.accounts;
    if (session && session.email === order.customer.email && !session.address.cep) {
      session = { ...session, address: order.address };
      accounts = accounts.map((a) => (a.email === session!.email ? { ...a, session: session! } : a));
    }
    return { ...st, orders: [order, ...st.orders], seq: st.seq + 1, cart: [], stock, logs, session, accounts };
  });
  track("InitiateCheckout", total);
  if (input.method === "cartao") window.setTimeout(() => confirmPayment(code), 1800);
  return order;
}

export function confirmPayment(code: string) {
  const s = getState();
  const order = s.orders.find((o) => o.code === code);
  if (!order || order.status !== "aguardando") return;
  const now = new Date().toISOString();
  const blingNo = String(4401 + s.orders.filter((o) => o.bling).length);
  const nfe = String(1270 + s.orders.filter((o) => o.bling?.nfe).length).padStart(6, "0");
  set((st) => ({
    ...st,
    orders: st.orders.map((o) =>
      o.code === code
        ? {
            ...o,
            status: "pago",
            payment: { ...o.payment, paidAt: now },
            bling: { number: blingNo, nfe, syncedAt: now },
            history: [...o.history, { at: now, status: "pago", text: "Pagamento aprovado pelo Mercado Pago" }],
          }
        : o,
    ),
    logs: [
      log("meta", `Compra #${code} recebida pelo navegador e pelo servidor, contada 1 vez`),
      log("bling", `NF-e ${nfe} emitida para o pedido #${code}`),
      log("bling", `Pedido #${code} criado no Bling como pedido de venda ${blingNo}`),
      log("mercadopago", `Pagamento do pedido #${code} aprovado e confirmado na loja`),
      ...st.logs,
    ],
    events: [{ id: uid(), at: now, name: "Purchase" as const, eventId: `ord-${code}`, value: order.total, browser: true, server: true }, ...st.events],
    lastSync: { ...st.lastSync, bling: now, mercadopago: now, meta: now },
  }));
}

/** Cancela pedidos Pix vencidos e devolve o estoque. */
export function expirePix() {
  const now = Date.now();
  const due = state.orders.filter((o) => o.status === "aguardando" && o.payment.method === "pix" && o.payment.expiresAt && new Date(o.payment.expiresAt).getTime() < now);
  if (!due.length) return;
  const at = new Date().toISOString();
  const stock = { ...state.stock };
  for (const o of due) for (const l of o.lines) if (garmentBySku(l.option)) stock[l.option] = (stock[l.option] ?? 0) + l.qty;
  state = {
    ...state,
    stock,
    orders: state.orders.map((o) =>
      due.includes(o) ? { ...o, status: "cancelado", history: [...o.history, { at, status: "cancelado", text: "Pix não pago em 30 minutos. Pedido cancelado e estoque devolvido" }] } : o,
    ),
    logs: [...due.map((o) => log("mercadopago", `Pix do pedido #${o.code} venceu sem pagamento. Pedido cancelado e estoque devolvido`, "aviso")), ...state.logs],
  };
  persist();
}

export function checkExpired() {
  load();
  const before = state;
  expirePix();
  if (state !== before) listeners.forEach((l) => l());
}

export function advanceOrder(code: string, to: OrderStatus, tracking?: string) {
  const now = new Date().toISOString();
  set((s) => ({
    ...s,
    orders: s.orders.map((o) => {
      if (o.code !== code) return o;
      const text =
        to === "producao"
          ? "Arte conferida e impressão iniciada"
          : to === "enviado"
            ? o.shipping.id === "retirada"
              ? "Pronto para retirada em Itajaí"
              : `Enviado por ${o.shipping.carrier} ${o.shipping.service}`
            : to === "entregue"
              ? o.shipping.id === "retirada"
                ? "Retirado na loja"
                : "Entregue ao destinatário"
              : "Status atualizado";
      return { ...o, status: to, tracking: tracking ?? o.tracking, history: [...o.history, { at: now, status: to, text }] };
    }),
    logs:
      to === "enviado"
        ? (() => {
            const o = s.orders.find((x) => x.code === code);
            return o && o.shipping.id !== "retirada" ? [log("frenet", `Etiqueta ${o.shipping.carrier} ${o.shipping.service} gerada para o pedido #${code}`), ...s.logs] : s.logs;
          })()
        : s.logs,
  }));
}

export function setStock(sku: string, qty: number) {
  const v = Math.max(0, Math.min(9999, Math.round(qty)));
  set((s) => ({
    ...s,
    stock: { ...s.stock, [sku]: v },
    logs: [log("bling", `Estoque de ${sku} atualizado para ${v} un. e enviado ao Bling`), ...s.logs],
    lastSync: { ...s.lastSync, bling: new Date().toISOString() },
  }));
}

const TEST_TEXT: Record<IntegrationId, string> = {
  bling: "Conexão com o Bling conferida: pedidos, estoque e NF-e respondendo",
  frenet: "Cotação de teste para CEP 01310-100: 3 opções devolvidas",
  mercadopago: "Conexão com o Mercado Pago conferida: Pix, cartão e boleto ativos",
  meta: "Evento de teste recebido pelo navegador e pelo servidor, contado 1 vez",
  ga4: "Evento de teste recebido no GA4 em tempo real",
};

export function testIntegration(id: IntegrationId) {
  const now = new Date().toISOString();
  set((s) => ({ ...s, logs: [log(id, TEST_TEXT[id]), ...s.logs], lastSync: { ...s.lastSync, [id]: now } }));
}
