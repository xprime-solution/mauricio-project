"use client";

import { Download, FileImage, FileText, Mail, MapPin, Phone, Printer, Search, Truck, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getProduct, parseSku } from "@/lib/catalog";
import { brl, fileSize, fmtDateTime, relTime } from "@/lib/format";
import { advanceOrder, useStore } from "@/lib/store";
import type { Order, OrderStatus } from "@/lib/types";
import { useNow } from "../motion";
import { STATUS } from "../order-view";
import { ProductMedia } from "../product-media";
import { Badge, Button, Spinner, useUi } from "../ui";
import { CustomerAvatar, payLabel } from "./common";
import { PageHead } from "./shell";

const TABS: (OrderStatus | "todos")[] = ["todos", "aguardando", "pago", "producao", "enviado", "entregue", "cancelado"];

function Detail({ order, onClose }: { order: Order; onClose: () => void }) {
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);
  const st = STATUS[order.status];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const act = (to: OrderStatus, msg: string) => {
    setBusy(true);
    window.setTimeout(() => {
      const tracking = to === "enviado" && order.shipping.id !== "retirada" ? (order.shipping.carrier === "Correios" ? `QP${String(Date.now()).slice(-9)}BR` : String(Date.now()).padEnd(14, "7")) : undefined;
      advanceOrder(order.code, to, tracking);
      setBusy(false);
      toast(msg);
    }, 700);
  };
  return (
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label={`Pedido ${order.code}`}>
      <div className="absolute inset-0 bg-ink/65 backdrop-blur-sm animate-fade" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-[min(100vw,560px)] flex-col border-l border-line-strong bg-panel/95 backdrop-blur-2xl" style={{ animation: "slide-in .35s cubic-bezier(.2,.8,.2,1) backwards" }}>
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div>
            <p className="text-[12.5px] text-mute">{fmtDateTime(order.createdAt)}</p>
            <h2 className="text-xl font-bold">Pedido #{order.code}</h2>
            <Badge tone={st.tone} className="mt-1.5">
              {st.label}
            </Badge>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-mute hover:bg-white/8 hover:text-text" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-[14px]">
          <div className="flex items-center gap-3">
            <CustomerAvatar email={order.customer.email} name={order.customer.name} size={48} />
            <div className="min-w-0">
              <p className="font-semibold">{order.customer.name}</p>
              <p className="text-[13px] text-mute">
                {order.customer.company ? `${order.customer.company} · ` : ""}
                {order.customer.doc}
              </p>
            </div>
          </div>
          <div className="grid gap-2 text-[13px] text-soft sm:grid-cols-2">
            <span className="flex items-center gap-2">
              <Mail className="size-4 text-mute" aria-hidden /> {order.customer.email}
            </span>
            <span className="flex items-center gap-2">
              <Phone className="size-4 text-mute" aria-hidden /> {order.customer.phone}
            </span>
          </div>

          <section className="rounded-2xl border border-line bg-night/50 p-4">
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">Itens e artes</h3>
            <ul className="divide-y divide-line">
              {order.lines.map((l, i) => {
                const p = getProduct(l.slug);
                return (
                  <li key={i} className="flex gap-3 py-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-night">{p && <ProductMedia product={p} color={p.kind === "vestuario" ? parseSku(l.option)?.color : undefined} sizes="48px" />}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <span className="truncate font-medium">{l.name}</span>
                        <span className="tabular-nums">{brl(l.unit * l.qty)}</span>
                      </div>
                      <p className="text-[12.5px] text-mute">
                        {l.optionLabel} · {l.qty} × {brl(l.unit)}
                        {p?.kind === "vestuario" && <span className="ml-1 font-mono text-[11.5px]">· {l.option}</span>}
                      </p>
                      {l.arts?.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => toast(`Arte ${a.name} baixada`)}
                          className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-[12.5px] text-soft hover:bg-white/5"
                        >
                          <FileImage className="size-3.5 shrink-0 text-lime-400" aria-hidden />
                          <span className="truncate">{a.name}</span>
                          <span className="ml-auto shrink-0 text-mute">{fileSize(a.size)}</span>
                          <Download className="size-3.5 shrink-0 text-mute" aria-hidden />
                        </button>
                      ))}
                      {l.note && <p className="mt-1 text-[12.5px] italic text-mute">“{l.note}”</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2 space-y-1 border-t border-line pt-3 text-[13.5px]">
              <div className="flex justify-between text-soft">
                <span>Frete · {order.shipping.id === "retirada" ? "retirada em Itajaí" : `${order.shipping.carrier} ${order.shipping.service}`}</span>
                <span className="tabular-nums">{order.shipping.price ? brl(order.shipping.price) : "Grátis"}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total · {payLabel(order)}</span>
                <span className="tabular-nums text-lime-300">{brl(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-night/50 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">
                <FileText className="size-3.5" aria-hidden /> Bling
              </h3>
              {order.bling ? (
                <p className="text-[13.5px] text-soft">
                  Pedido de venda <b className="text-text">{order.bling.number}</b>
                  <br />
                  NF-e <b className="text-text">{order.bling.nfe}</b> emitida
                  <br />
                  <span className="text-[12px] text-mute">Enviado em {fmtDateTime(order.bling.syncedAt)}</span>
                </p>
              ) : (
                <p className="text-[13.5px] text-mute">{order.status === "cancelado" ? "Pedido cancelado antes do pagamento, não foi para o Bling." : "Vai para o Bling assim que o pagamento for aprovado."}</p>
              )}
            </div>
            <div className="rounded-2xl border border-line bg-night/50 p-4">
              <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">
                <MapPin className="size-3.5" aria-hidden /> Entrega
              </h3>
              <p className="text-[13.5px] text-soft">
                {order.shipping.id === "retirada" ? (
                  "Retirada na loja em Itajaí"
                ) : (
                  <>
                    {order.address.street}, {order.address.number}
                    {order.address.complement ? `, ${order.address.complement}` : ""}
                    <br />
                    {order.address.city}/{order.address.uf} · {order.address.cep}
                  </>
                )}
              </p>
              {order.tracking && (
                <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[12.5px] text-lime-300">
                  <Truck className="size-3.5" aria-hidden /> {order.tracking}
                </p>
              )}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-mute">Histórico</h3>
            <ol className="relative space-y-3 border-l border-line pl-5">
              {[...order.history].reverse().map((h, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[25.5px] top-1 size-2.5 rounded-full ring-4 ring-panel ${h.status === "cancelado" ? "bg-danger" : i === 0 ? "bg-lime-500" : "bg-white/30"}`} />
                  <p className="text-[13.5px]">{h.text}</p>
                  <p className="text-[12px] text-mute">{fmtDateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-line p-5">
          {order.status === "pago" && (
            <Button disabled={busy} onClick={() => act("producao", `Pedido #${order.code} em produção`)}>
              {busy && <Spinner />} Conferi a arte, iniciar produção
            </Button>
          )}
          {order.status === "producao" && (
            <Button disabled={busy} onClick={() => act("enviado", order.shipping.id === "retirada" ? `Cliente avisado: pedido #${order.code} pronto para retirada` : `Etiqueta gerada e pedido #${order.code} enviado`)}>
              {busy ? <Spinner /> : order.shipping.id === "retirada" ? null : <Printer className="size-4" aria-hidden />} {order.shipping.id === "retirada" ? "Avisar que está pronto" : "Gerar etiqueta e enviar"}
            </Button>
          )}
          {order.status === "enviado" && (
            <Button disabled={busy} onClick={() => act("entregue", `Pedido #${order.code} marcado como entregue`)}>
              {busy && <Spinner />} {order.shipping.id === "retirada" ? "Marcar como retirado" : "Marcar como entregue"}
            </Button>
          )}
          {order.status === "aguardando" && <p className="text-[13px] text-mute">Aguardando o pagamento. O pedido muda sozinho quando o Mercado Pago confirmar.</p>}
          {(order.status === "entregue" || order.status === "cancelado") && <p className="text-[13px] text-mute">Pedido finalizado.</p>}
        </div>
      </aside>
    </div>
  );
}

export function Orders() {
  const s = useStore();
  const now = useNow(30000);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = (params.get("status") as OrderStatus | null) ?? "todos";
  const openCode = params.get("pedido");
  const [q, setQ] = useState("");

  const setParam = (k: string, v: string | null) => {
    const sp = new URLSearchParams(params.toString());
    if (v) sp.set(k, v);
    else sp.delete(k);
    router.replace(`${pathname}${sp.size ? `?${sp}` : ""}`, { scroll: false });
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: s.orders.length };
    for (const o of s.orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [s.orders]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return s.orders.filter((o) => (tab === "todos" || o.status === tab) && (!t || o.code.includes(t) || o.customer.name.toLowerCase().includes(t) || (o.customer.company ?? "").toLowerCase().includes(t)));
  }, [s.orders, tab, q]);

  const open = s.orders.find((o) => o.code === openCode);

  return (
    <>
      <PageHead title="Pedidos" text="Clique em um pedido para ver as artes, o Bling, a entrega e mudar o status." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setParam("status", t === "todos" ? null : t)} aria-pressed={tab === t} className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${tab === t ? "bg-lime-500 text-ink" : "bg-white/[0.05] text-soft hover:bg-white/10 hover:text-text"}`}>
            {t === "todos" ? "Todos" : STATUS[t].label}
            <span className={`ml-1.5 text-[12px] ${tab === t ? "text-ink/70" : "text-mute"}`}>{counts[t] ?? 0}</span>
          </button>
        ))}
        <label className="relative ml-auto w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nº, cliente ou empresa" aria-label="Buscar pedidos" className="h-10 w-full rounded-full border border-line-strong bg-night pl-9 pr-4 text-[13.5px] outline-none focus:border-lime-500" />
        </label>
      </div>
      <div className="overflow-hidden rounded-3xl border border-line bg-panel/70">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[13.5px]">
            <thead>
              <tr className="bg-white/[0.04] text-left text-[11.5px] uppercase tracking-[0.12em] text-mute">
                <th className="px-5 py-3">Pedido</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Itens</th>
                <th className="px-5 py-3">Pagamento</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Bling</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.code} onClick={() => setParam("pedido", o.code)} className="cursor-pointer border-t border-line transition hover:bg-white/[0.04]" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setParam("pedido", o.code)}>
                  <td className="px-5 py-3">
                    <span className="font-semibold">#{o.code}</span>
                    <span className="block text-[12px] text-mute">{relTime(o.createdAt, now)}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2.5">
                      <CustomerAvatar email={o.customer.email} name={o.customer.name} size={32} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{o.customer.name}</span>
                        <span className="block truncate text-[12px] text-mute">
                          {o.customer.company ? `${o.customer.company} · ` : ""}
                          {o.address.city}/{o.address.uf}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-soft">
                    {o.lines.reduce((a, l) => a + l.qty, 0)} un.
                    <span className="block max-w-48 truncate text-[12px] text-mute">{[...new Set(o.lines.map((l) => l.name))].join(", ")}</span>
                  </td>
                  <td className="px-5 py-3 text-soft">{payLabel(o)}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS[o.status].tone}>{STATUS[o.status].label}</Badge>
                  </td>
                  <td className="px-5 py-3 text-[12.5px] text-soft">{o.bling ? <>Nº {o.bling.number} · NF-e {o.bling.nfe}</> : <span className="text-mute">Aguardando pagamento</span>}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{brl(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="border-t border-line p-10 text-center text-soft">Nenhum pedido nesse filtro.</p>}
      </div>
      {open && <Detail order={open} onClose={() => setParam("pedido", null)} />}
    </>
  );
}
