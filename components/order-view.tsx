"use client";

import { Barcode, Check, CheckCircle2, Copy, CreditCard, FileImage, FileText, MapPin, PackageCheck, Printer, QrCode, Truck, XCircle } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { getProduct, parseSku } from "@/lib/catalog";
import { brl, fmtDate, fmtDateTime } from "@/lib/format";
import { checkExpired, confirmPayment, useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { STORE } from "./brand";
import { useHydrated, useNow } from "./motion";
import { ProductMedia } from "./product-media";
import { Badge, Button, ButtonLink, Spinner, useUi } from "./ui";

export const STATUS: Record<OrderStatus, { label: string; tone: "lime" | "grape" | "mute" | "warn" | "danger" | "info" }> = {
  aguardando: { label: "Aguardando pagamento", tone: "warn" },
  pago: { label: "Pagamento aprovado", tone: "lime" },
  producao: { label: "Em produção", tone: "grape" },
  enviado: { label: "Enviado", tone: "info" },
  entregue: { label: "Entregue", tone: "lime" },
  cancelado: { label: "Cancelado", tone: "danger" },
};

const FLOW: OrderStatus[] = ["aguardando", "pago", "producao", "enviado", "entregue"];

const tlv = (id: string, v: string) => `${id}${String(v.length).padStart(2, "0")}${v}`;

export function pixPayload(o: Order) {
  const key = `dtf4u${o.code}${o.createdAt.replace(/\D/g, "").slice(2, 14)}`.slice(0, 36);
  const body =
    tlv("00", "01") +
    tlv("01", "12") +
    tlv("26", tlv("00", "br.gov.bcb.pix") + tlv("01", key)) +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", o.total.toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", "DTF4U") +
    tlv("60", "ITAJAI") +
    tlv("62", tlv("05", `PED${o.code}`)) +
    "6304";
  let crc = 0xffff;
  for (const ch of body) {
    crc ^= ch.charCodeAt(0) << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xffff;
  }
  return body + crc.toString(16).toUpperCase().padStart(4, "0");
}

function useCountdown(until?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [until]);
  if (!until) return null;
  return Math.max(0, Math.floor((new Date(until).getTime() - now) / 1000));
}

function PixPanel({ order }: { order: Order }) {
  const { toast } = useUi();
  const [qr, setQr] = useState("");
  const [checking, setChecking] = useState(false);
  const code = useMemo(() => pixPayload(order), [order]);
  const left = useCountdown(order.payment.expiresAt);
  useEffect(() => {
    QRCode.toDataURL(code, { margin: 1, width: 440, color: { dark: "#0e0c12", light: "#ffffff" } }).then(setQr);
  }, [code]);
  useEffect(() => {
    if (left === 0) checkExpired();
  }, [left]);
  const mm = String(Math.floor((left ?? 0) / 60)).padStart(2, "0");
  const ss = String((left ?? 0) % 60).padStart(2, "0");
  return (
    <div className="grid gap-6 rounded-3xl border border-lime-500/30 bg-gradient-to-br from-grape-900/60 to-panel p-6 md:grid-cols-[220px_1fr] md:p-8">
      <div className="mx-auto w-[220px] rounded-2xl bg-white p-3">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="QR Code Pix do pedido" className="h-auto w-full" />
        ) : (
          <div className="aspect-square w-full animate-pulse rounded-lg bg-black/10" />
        )}
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-lime-300">
          <QrCode className="size-4" aria-hidden /> Pague com Pix
        </p>
        <p className="mt-2 text-[28px] font-extrabold tabular-nums">{brl(order.total)}</p>
        <p className="mt-1 text-[14px] text-soft">
          Abra o app do seu banco, escolha Pix e leia o QR Code ou cole o código. Ele vence em{" "}
          <b className={`tabular-nums ${left !== null && left < 300 ? "text-warn" : "text-text"}`}>
            {mm}:{ss}
          </b>
          .
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-line-strong bg-night p-2 pl-4">
          <code className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-soft">{code}</code>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(code).then(
                () => toast("Código Pix copiado"),
                () => toast("Não foi possível copiar. Selecione o código e copie.", "erro"),
              );
            }}
          >
            <Copy className="size-4" aria-hidden /> Copiar
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            disabled={checking}
            onClick={() => {
              setChecking(true);
              window.setTimeout(() => {
                confirmPayment(order.code);
                setChecking(false);
              }, 1600);
            }}
          >
            {checking ? <Spinner /> : <CheckCircle2 className="size-4" aria-hidden />} {checking ? "Consultando o pagamento..." : "Já paguei"}
          </Button>
          <span className="text-[12.5px] text-mute">A confirmação também chega sozinha assim que o pagamento cai.</span>
        </div>
      </div>
    </div>
  );
}

function Timeline({ order }: { order: Order }) {
  const reached = order.status === "cancelado" ? -1 : FLOW.indexOf(order.status);
  const labels = ["Pedido recebido", "Pagamento aprovado", "Em produção", order.shipping.id === "retirada" ? "Pronto para retirar" : "Enviado", order.shipping.id === "retirada" ? "Retirado" : "Entregue"];
  const when = (st: OrderStatus) => order.history.find((h) => h.status === st)?.at;
  if (order.status === "cancelado") {
    const h = order.history.find((x) => x.status === "cancelado");
    return (
      <div className="flex items-start gap-3 rounded-3xl border border-danger/30 bg-danger/5 p-5">
        <XCircle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <div>
          <p className="font-semibold">Pedido cancelado</p>
          <p className="mt-1 text-[14px] text-soft">{h?.text}</p>
        </div>
      </div>
    );
  }
  return (
    <ol className="grid grid-cols-5 gap-2">
      {labels.map((l, i) => {
        const done = i <= reached;
        const at = when(FLOW[i]);
        return (
          <li key={l} className="relative text-center">
            {i > 0 && <span className={`absolute right-1/2 top-[18px] h-0.5 w-full -translate-y-1/2 ${i <= reached ? "bg-lime-500" : "bg-white/10"}`} />}
            <span className={`relative z-10 mx-auto grid size-9 place-items-center rounded-full ring-4 ring-ink transition ${done ? "bg-lime-500 text-ink" : "bg-panel-2 text-mute"}`}>
              {done ? <Check className="size-4" aria-hidden /> : <span className="text-[12px] font-bold">{i + 1}</span>}
            </span>
            <span className={`mt-2 block text-[12px] font-semibold leading-tight md:text-[13px] ${done ? "" : "text-mute"}`}>{l}</span>
            {at && <span className="mt-0.5 block text-[11px] text-mute">{fmtDateTime(at)}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function OrderView({ code }: { code: string }) {
  const s = useStore();
  const hydrated = useHydrated();
  const now = useNow(5000);
  const order = s.orders.find((o) => o.code === code);

  useEffect(() => {
    if (order?.status === "aguardando" && order.payment.method === "cartao") {
      const t = window.setTimeout(() => confirmPayment(order.code), 1800);
      return () => window.clearTimeout(t);
    }
  }, [order?.status, order?.payment.method, order?.code]);

  if (!hydrated || !s.ready) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-10 md:px-6">
        <div className="skeleton h-10 w-72 rounded-xl" />
        <div className="skeleton mt-8 h-64 rounded-3xl" />
      </div>
    );
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Pedido não encontrado</h1>
        <p className="mt-2 text-soft">Confira o número do pedido ou veja a lista na sua conta.</p>
        <ButtonLink href="/minha-conta" className="mt-6">
          Ver meus pedidos
        </ButtonLink>
      </div>
    );
  }

  const st = STATUS[order.status];
  const justPaid = order.status === "pago" && order.payment.paidAt && now - new Date(order.payment.paidAt).getTime() < 120000;
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-mute">Feito em {fmtDateTime(order.createdAt)}</p>
          <h1 className="mt-1 text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold tracking-[-0.03em]">Pedido #{order.code}</h1>
        </div>
        <Badge tone={st.tone} className="text-[13px]">
          {st.label}
        </Badge>
      </div>

      {justPaid && (
        <div className="mt-6 flex items-center gap-4 rounded-3xl border border-lime-500/40 bg-lime-500/10 p-5 animate-pop">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-lime-500 text-ink shadow-glow">
            <Check className="size-6" aria-hidden />
          </span>
          <div>
            <p className="text-[17px] font-bold">Pagamento aprovado. Obrigado, {order.customer.name.split(" ")[0]}!</p>
            <p className="text-[14px] text-soft">Enviamos a confirmação para {order.customer.email}. Agora a sua arte segue para conferência e produção.</p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {order.status === "aguardando" && order.payment.method === "pix" && <PixPanel order={order} />}
        {order.status === "aguardando" && order.payment.method === "cartao" && (
          <div className="flex items-center gap-4 rounded-3xl border border-line-strong bg-panel p-6">
            <Spinner className="size-6 text-lime-400" />
            <div>
              <p className="font-semibold">Analisando o pagamento no cartão</p>
              <p className="text-[14px] text-soft">Isso leva poucos segundos. Não feche esta página.</p>
            </div>
          </div>
        )}
        {order.status === "aguardando" && order.payment.method === "boleto" && (
          <div className="rounded-3xl border border-line-strong bg-panel p-6">
            <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-lime-300">
              <Barcode className="size-4" aria-hidden /> Boleto gerado
            </p>
            <p className="mt-2 text-[14px] text-soft">
              Vence em {order.payment.boletoDue ? fmtDate(order.payment.boletoDue) : "3 dias úteis"}. A produção começa assim que o banco confirma o pagamento.
            </p>
            <code className="mt-4 block break-all rounded-2xl border border-line-strong bg-night p-4 font-mono text-[13px] tracking-wide">{order.payment.boletoLine}</code>
            <div className="mt-4 flex flex-wrap gap-3">
              <CopyButton text={order.payment.boletoLine ?? ""} label="Copiar linha digitável" />
              <ButtonLink href={`/pedido/${order.code}/boleto`} variant="outline">
                <Printer className="size-4" aria-hidden /> Abrir boleto para imprimir
              </ButtonLink>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-line bg-panel/60 p-6">
          <h2 className="mb-5 text-[15px] font-semibold">Acompanhamento</h2>
          <Timeline order={order} />
          {order.tracking && (
            <p className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-night/70 p-4 text-[14px]">
              <Truck className="size-4 text-lime-400" aria-hidden /> Código de rastreio {order.shipping.carrier}: <b className="font-mono tracking-wide">{order.tracking}</b>
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-line bg-panel/60 p-6">
            <h2 className="mb-2 text-[15px] font-semibold">Itens</h2>
            <ul className="divide-y divide-line">
              {order.lines.map((l, i) => {
                const p = getProduct(l.slug);
                return (
                  <li key={i} className="flex gap-3 py-3.5">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-night">{p && <ProductMedia product={p} color={p.kind === "vestuario" ? parseSku(l.option)?.color : undefined} sizes="56px" />}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <span className="truncate text-[14px] font-semibold">{l.name}</span>
                        <span className="shrink-0 text-[14px] font-semibold tabular-nums">{brl(l.unit * l.qty)}</span>
                      </div>
                      <p className="text-[12.5px] text-mute">
                        {l.optionLabel} · {l.qty} × {brl(l.unit)}
                      </p>
                      {l.arts?.map((a) => (
                        <p key={a.id} className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-soft">
                          <FileImage className="size-3.5 shrink-0 text-lime-400" aria-hidden /> {a.name}
                        </p>
                      ))}
                      {l.note && <p className="mt-0.5 text-[12px] italic text-mute">“{l.note}”</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-line bg-panel/60 p-6 text-[14px]">
              <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
                <MapPin className="size-4 text-lime-400" aria-hidden /> Entrega
              </h2>
              {order.shipping.id === "retirada" ? (
                <p className="text-soft">Retirada na loja: {STORE.address}. {STORE.hours}.</p>
              ) : (
                <p className="text-soft">
                  {order.address.street}, {order.address.number}
                  {order.address.complement ? `, ${order.address.complement}` : ""}
                  <br />
                  {order.address.district} · {order.address.city}/{order.address.uf} · {order.address.cep}
                </p>
              )}
              <p className="mt-2 text-mute">
                {order.shipping.id === "retirada" ? "Sem custo de frete" : `${order.shipping.carrier} ${order.shipping.service} · ${order.shipping.days}`}
              </p>
            </div>
            <div className="rounded-3xl border border-line bg-panel/60 p-6 text-[14px]">
              <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold">
                {order.payment.method === "pix" ? <QrCode className="size-4 text-lime-400" aria-hidden /> : order.payment.method === "boleto" ? <Barcode className="size-4 text-lime-400" aria-hidden /> : <CreditCard className="size-4 text-lime-400" aria-hidden />} Pagamento
              </h2>
              <dl className="space-y-1.5">
                <div className="flex justify-between">
                  <dt className="text-soft">Subtotal</dt>
                  <dd className="tabular-nums">{brl(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-soft">Frete</dt>
                  <dd className="tabular-nums">{order.shipping.price ? brl(order.shipping.price) : "Grátis"}</dd>
                </div>
                <div className="flex justify-between border-t border-line pt-2 font-bold">
                  <dt>Total</dt>
                  <dd className="tabular-nums text-lime-300">{brl(order.total)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-mute">
                {order.payment.method === "pix" ? "Pix" : order.payment.method === "boleto" ? "Boleto" : `Cartão final ${order.payment.cardLast4} · ${order.payment.installments ?? 1}x de ${brl(order.total / (order.payment.installments ?? 1))}`}
              </p>
              {order.bling?.nfe && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-night/70 p-3 text-soft">
                  <FileText className="size-4 text-lime-400" aria-hidden /> Nota fiscal nº {order.bling.nfe} enviada para o seu e-mail
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/">Continuar comprando</ButtonLink>
          {s.session && (
            <ButtonLink href="/minha-conta" variant="outline">
              <PackageCheck className="size-4" aria-hidden /> Ver meus pedidos
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const { toast } = useUi();
  return (
    <Button
      variant="outline"
      onClick={() =>
        navigator.clipboard?.writeText(text).then(
          () => toast("Linha digitável copiada"),
          () => toast("Não foi possível copiar. Selecione o texto e copie.", "erro"),
        )
      }
    >
      <Copy className="size-4" aria-hidden /> {label}
    </Button>
  );
}
