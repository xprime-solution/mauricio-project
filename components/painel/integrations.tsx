"use client";

import { BarChart3, CheckCircle2, CreditCard, FileText, Megaphone, Truck } from "lucide-react";
import { useState } from "react";
import { fmtDateTime, relTime } from "@/lib/format";
import { testIntegration, useStore } from "@/lib/store";
import type { IntegrationId } from "@/lib/types";
import { useNow } from "../motion";
import { Badge, Button, Spinner, useUi } from "../ui";
import { PageHead } from "./shell";

const META: Record<IntegrationId, { name: string; what: string; icon: typeof Truck }> = {
  bling: { name: "Bling", what: "Pedidos, estoque e nota fiscal", icon: FileText },
  frenet: { name: "Frenet", what: "Cotação de frete e etiquetas", icon: Truck },
  mercadopago: { name: "Mercado Pago", what: "Pix, cartão e boleto", icon: CreditCard },
  meta: { name: "Meta Pixel + API de Conversões", what: "Compras para os anúncios do Instagram e Facebook", icon: Megaphone },
  ga4: { name: "Google Analytics 4", what: "Funil do site pelo Google Tag Manager", icon: BarChart3 },
};

const IDS = Object.keys(META) as IntegrationId[];

export function Integrations() {
  const s = useStore();
  const now = useNow(30000);
  const { toast } = useUi();
  const [testing, setTesting] = useState<IntegrationId | null>(null);
  const [filter, setFilter] = useState<IntegrationId | "todas">("todas");

  const paid = s.orders.filter((o) => o.bling);
  const shipped = s.orders.filter((o) => o.tracking).length;
  const purchases = s.events.filter((e) => e.name === "Purchase");
  const serverOnly = purchases.filter((e) => e.server && !e.browser).length;
  const byMethod = (m: string) => s.orders.filter((o) => o.payment.method === m && o.payment.paidAt).length;
  const cancelled = s.orders.filter((o) => o.status === "cancelado").length;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const eventsToday = s.events.filter((e) => new Date(e.at) >= today).length;

  const stats: Record<IntegrationId, [string, string][]> = {
    bling: [
      ["Pedidos enviados", String(paid.length)],
      ["NF-e emitidas", String(paid.filter((o) => o.bling?.nfe).length)],
    ],
    frenet: [
      ["Etiquetas geradas", String(shipped)],
      ["Transportadoras", "Correios e Jadlog"],
    ],
    mercadopago: [
      ["Aprovados", `${byMethod("pix")} Pix · ${byMethod("cartao")} cartão · ${byMethod("boleto")} boleto`],
      ["Pix vencidos", String(cancelled)],
    ],
    meta: [
      ["Compras registradas", String(purchases.length)],
      ["Só pelo servidor", `${serverOnly} de ${purchases.length}`],
    ],
    ga4: [
      ["Eventos hoje", String(eventsToday)],
      ["Contêiner", "GTM-MR79PR3X"],
    ],
  };

  const logs = s.logs.filter((l) => filter === "todas" || l.integration === filter).slice(0, 40);

  return (
    <>
      <PageHead title="Integrações" text="Tudo o que o site troca com Bling, Frenet, Mercado Pago, Meta e Google, com data e hora." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {IDS.map((id) => {
          const m = META[id];
          return (
            <section key={id} className="flex flex-col rounded-3xl border border-line bg-panel/70 p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-line">
                  <m.icon className="size-5 text-lime-400" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[15.5px] font-semibold leading-tight">{m.name}</h2>
                  <p className="text-[12.5px] text-mute">{m.what}</p>
                </div>
                <Badge tone="lime">
                  <CheckCircle2 className="size-3" aria-hidden /> Conectado
                </Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {stats[id].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-night/60 p-3">
                    <dt className="text-[11.5px] text-mute">{k}</dt>
                    <dd className="mt-0.5 text-[14px] font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              {id === "meta" && serverOnly > 0 && (
                <p className="mt-3 rounded-2xl border border-lime-500/25 bg-lime-500/10 p-3 text-[12.5px] text-soft">
                  {serverOnly} {serverOnly === 1 ? "compra chegou" : "compras chegaram"} só pela API de Conversões porque o navegador bloqueou o Pixel. Sem ela {serverOnly === 1 ? "essa venda ficaria" : "essas vendas ficariam"} de fora dos relatórios de anúncio.
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                <span className="text-[12px] text-mute">Última atividade {s.lastSync[id] ? relTime(s.lastSync[id], now) : ""}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="whitespace-nowrap"
                  disabled={testing !== null}
                  onClick={() => {
                    setTesting(id);
                    window.setTimeout(() => {
                      testIntegration(id);
                      setTesting(null);
                      toast(`${m.name}: conexão conferida`);
                    }, 1200);
                  }}
                >
                  {testing === id && <Spinner />} Testar conexão
                </Button>
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-6 rounded-3xl border border-line bg-panel/70 p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[16px] font-semibold">Registro de atividade</h2>
          <div className="flex flex-wrap gap-1.5">
            {(["todas", ...IDS] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={`rounded-full px-3 py-1 text-[12.5px] font-medium transition ${filter === f ? "bg-lime-500 text-ink" : "bg-white/[0.05] text-soft hover:bg-white/10"}`}>
                {f === "todas" ? "Todas" : META[f].name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-line">
          {logs.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-[13.5px]">
              <span className="w-36 shrink-0 font-mono text-[12px] text-mute">{fmtDateTime(l.at)}</span>
              <Badge tone={l.level === "ok" ? "mute" : "warn"} className="shrink-0">
                {META[l.integration].name.split(" ")[0]}
              </Badge>
              <span className={`min-w-0 flex-1 ${l.level === "aviso" ? "text-warn" : "text-soft"}`}>{l.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
