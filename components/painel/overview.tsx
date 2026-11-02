"use client";

import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { allGarmentSkus, COLORS, getProduct } from "@/lib/catalog";
import { brl, fmtShort, relTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { IntegrationId } from "@/lib/types";
import { Counter, useNow } from "../motion";
import { STATUS } from "../order-view";
import { Badge } from "../ui";
import { CustomerAvatar, Kpi } from "./common";
import { PageHead } from "./shell";

const DAY = 86400000;
const INTEGRATIONS: { id: IntegrationId; name: string }[] = [
  { id: "bling", name: "Bling" },
  { id: "frenet", name: "Frenet" },
  { id: "mercadopago", name: "Mercado Pago" },
  { id: "meta", name: "Meta Pixel e API de Conversões" },
  { id: "ga4", name: "Google Analytics 4" },
];

function RevenueChart({ days }: { days: { date: string; value: number; orders: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...days.map((d) => d.value), 1);
  const nice = Math.ceil(max / 500) * 500;
  const W = 700;
  const H = 220;
  const pad = { l: 74, r: 8, t: 12, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const bw = iw / days.length;
  const ticks = [0, nice / 2, nice];
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Vendas pagas por dia nos últimos 14 dias">
        {ticks.map((t) => {
          const y = pad.t + ih - (t / nice) * ih;
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9a93a6">
                {t >= 1000 ? `R$ ${(t / 1000).toLocaleString("pt-BR")} mil` : `R$ ${t}`}
              </text>
            </g>
          );
        })}
        {days.map((d, i) => {
          const h = (d.value / nice) * ih;
          const x = pad.l + i * bw + 2;
          const w = bw - 4;
          const y = pad.t + ih - h;
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={pad.l + i * bw} y={pad.t} width={bw} height={ih} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${y + ih * 0 + h} L${x},${y + Math.min(4, h)} Q${x},${y} ${x + 4},${y} L${x + w - 4},${y} Q${x + w},${y} ${x + w},${y + Math.min(4, h)} L${x + w},${y + h} Z`}
                  fill={hover === i ? "#c4f26a" : "#8cd312"}
                  opacity={hover === null || hover === i ? 1 : 0.55}
                  style={{ transition: "opacity .2s, fill .2s" }}
                />
              )}
              {(days.length - 1 - i) % 2 === 0 && (
                <text x={pad.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#9a93a6">
                  {fmtShort(d.date)}
                </text>
              )}
            </g>
          );
        })}
        <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih} y2={pad.t + ih} stroke="rgba(255,255,255,0.2)" />
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl border border-line-strong bg-panel-2/95 px-3 py-2 text-[12.5px] shadow-lift backdrop-blur-md" style={{ left: `${((pad.l + hover * bw + bw / 2) / W) * 100}%`, top: `${((pad.t + ih - (days[hover].value / nice) * ih) / H) * 100}%` }}>
          <span className="block font-semibold">{fmtShort(days[hover].date)}</span>
          <span className="block tabular-nums text-soft">
            {brl(days[hover].value)} · {days[hover].orders} {days[hover].orders === 1 ? "pedido" : "pedidos"}
          </span>
        </div>
      )}
    </div>
  );
}

export function Overview() {
  const s = useStore();
  const now = useNow(60000);
  const data = useMemo(() => {
    const paidOrders = s.orders.filter((o) => o.payment.paidAt && o.status !== "cancelado");
    const since7 = now - 7 * DAY;
    const week = paidOrders.filter((o) => new Date(o.payment.paidAt!).getTime() >= since7);
    const revenue = week.reduce((a, o) => a + o.total, 0);
    const withDtf = paidOrders.filter((o) => o.lines.some((l) => ["impressao-dtf", "dtf-uv", "estampas"].includes(getProduct(l.slug)?.category ?? "")));
    const cross = withDtf.filter((o) => o.lines.some((l) => getProduct(l.slug)?.kind === "vestuario"));
    const shirts = paidOrders.flatMap((o) => o.lines).filter((l) => getProduct(l.slug)?.kind === "vestuario").reduce((a, l) => a + l.qty, 0);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 14 }, (_, i) => {
      const d0 = start.getTime() - (13 - i) * DAY;
      const list = paidOrders.filter((o) => {
        const t = new Date(o.payment.paidAt!).getTime();
        return t >= d0 && t < d0 + DAY;
      });
      return { date: new Date(d0).toISOString(), value: list.reduce((a, o) => a + o.total, 0), orders: list.length };
    });
    return { week, revenue, withDtf, cross, shirts, days };
  }, [s.orders, now]);

  const waiting = s.orders.filter((o) => o.status === "aguardando");
  const toProduce = s.orders.filter((o) => o.status === "pago");
  const low = allGarmentSkus()
    .map((x) => ({ ...x, qty: s.stock[x.sku] ?? 0 }))
    .filter((x) => x.qty <= 5)
    .sort((a, b) => a.qty - b.qty);
  const crossPct = data.withDtf.length ? Math.round((data.cross.length / data.withDtf.length) * 100) : 0;

  return (
    <>
      <PageHead title="Visão geral" text="Como a loja está hoje, com os números dos pedidos pagos." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi accent label="Vendas pagas · 7 dias" value={<Counter to={data.revenue} format={(v) => brl(v)} />} sub={`${data.week.length} pedidos pagos`} />
        <Kpi label="Ticket médio · 7 dias" value={<Counter to={data.week.length ? data.revenue / data.week.length : 0} format={(v) => brl(v)} />} sub="Total dividido por pedido" />
        <Kpi label="Pedidos de DTF com camiseta" value={<Counter to={crossPct} suffix="%" />} sub={`${data.cross.length} de ${data.withDtf.length} pedidos com impressão`} />
        <Kpi label="Camisetas e peças vendidas" value={<Counter to={data.shirts} />} sub="Em pedidos pagos" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-line bg-panel/70 p-5 md:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[16px] font-semibold">Vendas pagas por dia</h2>
            <span className="text-[13px] text-mute">Últimos 14 dias · passe o mouse nas barras</span>
          </div>
          <RevenueChart days={data.days} />
          <details className="mt-3 text-[13px] text-soft">
            <summary className="cursor-pointer text-mute hover:text-text">Ver os números em tabela</summary>
            <table className="mt-2 w-full">
              <tbody>
                {data.days.map((d) => (
                  <tr key={d.date} className="border-t border-line">
                    <td className="py-1.5">{fmtShort(d.date)}</td>
                    <td className="py-1.5 text-right tabular-nums">{d.orders}</td>
                    <td className="py-1.5 text-right tabular-nums">{brl(d.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>

        <section className="space-y-4">
          <div className="rounded-3xl border border-line bg-panel/70 p-5">
            <h2 className="mb-3 text-[16px] font-semibold">Para fazer agora</h2>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link href="/painel/pedidos?status=pago" className="flex items-center justify-between rounded-2xl bg-lime-500/10 p-3.5 ring-1 ring-inset ring-lime-500/25 hover:bg-lime-500/15">
                  <span>
                    <b className="block text-[15px]">{toProduce.length} pedidos pagos</b>
                    <span className="text-[12.5px] text-soft">Prontos para conferir a arte e produzir</span>
                  </span>
                  <ArrowRight className="size-4 text-lime-300" aria-hidden />
                </Link>
              </li>
              <li>
                <Link href="/painel/pedidos?status=aguardando" className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-3.5 ring-1 ring-inset ring-line hover:bg-white/[0.07]">
                  <span>
                    <b className="block text-[15px]">{waiting.length} aguardando pagamento</b>
                    <span className="text-[12.5px] text-soft">Pix vencido cancela sozinho em 30 minutos</span>
                  </span>
                  <ArrowRight className="size-4 text-mute" aria-hidden />
                </Link>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-line bg-panel/70 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Integrações</h2>
              <Link href="/painel/integracoes" className="text-[13px] font-medium text-lime-300 hover:text-lime-400">
                Detalhes
              </Link>
            </div>
            <ul className="space-y-2">
              {INTEGRATIONS.map((i) => (
                <li key={i.id} className="flex items-center gap-2.5 text-[13.5px]">
                  <CheckCircle2 className="size-4 text-lime-400" aria-label="Conectado" />
                  <span className="flex-1">{i.name}</span>
                  <span className="text-[12px] text-mute">{s.lastSync[i.id] ? relTime(s.lastSync[i.id], now) : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-line bg-panel/70 p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold">Últimos pedidos</h2>
            <Link href="/painel/pedidos" className="text-[13px] font-medium text-lime-300 hover:text-lime-400">
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {s.orders.slice(0, 6).map((o) => (
              <li key={o.code}>
                <Link href={`/painel/pedidos?pedido=${o.code}`} className="flex items-center gap-3 py-3 hover:opacity-90">
                  <CustomerAvatar email={o.customer.email} name={o.customer.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">
                      #{o.code} · {o.customer.name}
                    </span>
                    <span className="block truncate text-[12.5px] text-mute">
                      {o.customer.company ? `${o.customer.company} · ` : ""}
                      {relTime(o.createdAt, now)}
                    </span>
                  </span>
                  <Badge tone={STATUS[o.status].tone}>{STATUS[o.status].label}</Badge>
                  <span className="w-24 text-right text-[14px] font-semibold tabular-nums">{brl(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border border-line bg-panel/70 p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[16px] font-semibold">
              <AlertTriangle className="size-4 text-warn" aria-hidden /> Estoque baixo
            </h2>
            <Link href="/painel/estoque" className="text-[13px] font-medium text-lime-300 hover:text-lime-400">
              Ajustar
            </Link>
          </div>
          {low.length ? (
            <ul className="space-y-2">
              {low.slice(0, 7).map((x) => (
                <li key={x.sku} className="flex items-center gap-3 text-[13.5px]">
                  <span className="size-4 shrink-0 rounded-full ring-1 ring-white/20" style={{ background: COLORS[x.color].hex }} />
                  <span className="min-w-0 flex-1 truncate">
                    {x.product.name} · {COLORS[x.color].name} {x.size}
                  </span>
                  <span className={`font-mono text-[12px] ${x.qty === 0 ? "text-danger" : "text-warn"}`}>{x.qty === 0 ? "esgotado" : `${x.qty} un.`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-soft">Nenhuma cor ou tamanho com 5 peças ou menos.</p>
          )}
        </section>
      </div>
    </>
  );
}
