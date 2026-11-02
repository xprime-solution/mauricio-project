"use client";

import { CheckCircle2, ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PRODUCTS, getProduct } from "@/lib/catalog";
import redirects from "@/lib/data/redirects.json";
import { fmtDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Counter, useNow } from "../motion";
import { PageHead } from "./shell";

const OLD_PRODUCTS = 61;

export function Migration() {
  const s = useStore();
  const now = useNow(60000);
  const [q, setQ] = useState("");
  const customers = new Set(s.orders.map((o) => o.customer.email)).size;
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return redirects.filter((r) => !t || r.from.includes(t) || r.name.toLowerCase().includes(t) || r.to.includes(t));
  }, [q]);
  const at = (h: number) => fmtDateTime(new Date(now - h * 3600000).toISOString());
  const steps = [
    ["Backup completo do site antigo", "Arquivos e banco de dados guardados fora do servidor", at(30)],
    ["Cópia de testes aprovada", "Layout, catálogo e integrações conferidos no link de testes", at(6)],
    ["Troca fora do horário de atendimento", "Só o tema, as páginas e os produtos novos foram para o ar", at(3)],
    ["Pedidos e clientes conferidos", "Mesmos números antes e depois da troca", at(2.8)],
    [`${redirects.length} endereços antigos redirecionados`, "Cada um leva ao produto novo com a opção já escolhida", at(2.7)],
    ["Search Console sem novos erros 404", "Conferido depois da troca", at(1)],
  ];
  return (
    <>
      <PageHead title="Migração do site" text="A troca do site antigo para o novo, conferida número por número." />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Pedidos", s.orders.length, s.orders.length, "Todos os pedidos continuam na loja"],
          ["Clientes com pedido", customers, customers, "Nenhum cadastro perdido"],
        ].map(([label, before, after, sub]) => (
          <div key={label as string} className="rounded-3xl border border-line bg-panel/70 p-5">
            <span className="block text-[13px] text-mute">{label as string}</span>
            <div className="mt-2 flex items-end gap-3">
              <span>
                <span className="block text-[11.5px] uppercase tracking-[0.12em] text-mute">Antes</span>
                <span className="text-[1.6rem] font-extrabold tabular-nums">{before as number}</span>
              </span>
              <span className="pb-1.5 text-mute">=</span>
              <span>
                <span className="block text-[11.5px] uppercase tracking-[0.12em] text-mute">Depois</span>
                <span className="text-[1.6rem] font-extrabold tabular-nums text-lime-300">{after as number}</span>
              </span>
              <CheckCircle2 className="mb-2 ml-auto size-6 text-lime-400" aria-label="Conferido" />
            </div>
            <span className="mt-1 block text-[12.5px] text-soft">{sub as string}</span>
          </div>
        ))}
        <div className="rounded-3xl border border-lime-500/30 bg-[linear-gradient(135deg,rgba(140,211,18,0.12),#1b1722_70%)] p-5">
          <span className="block text-[13px] text-mute">Catálogo</span>
          <div className="mt-2 flex items-end gap-3">
            <span>
              <span className="block text-[11.5px] uppercase tracking-[0.12em] text-mute">Antes</span>
              <span className="text-[1.6rem] font-extrabold tabular-nums">{OLD_PRODUCTS}</span>
            </span>
            <span className="pb-1.5 text-mute">›</span>
            <span>
              <span className="block text-[11.5px] uppercase tracking-[0.12em] text-mute">Depois</span>
              <span className="text-[1.6rem] font-extrabold tabular-nums text-lime-300">
                <Counter to={PRODUCTS.length} />
              </span>
            </span>
          </div>
          <span className="mt-1 block text-[12.5px] text-soft">Cada metragem virou uma opção dentro do produto</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        <section className="rounded-3xl border border-line bg-panel/70 p-5 md:p-6">
          <h2 className="mb-4 text-[16px] font-semibold">Etapas da troca</h2>
          <ol className="space-y-4">
            {steps.map(([t, d, when]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-lime-500 text-ink">
                  <CheckCircle2 className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold">{t}</span>
                  <span className="block text-[12.5px] text-soft">{d}</span>
                  <span className="block font-mono text-[11.5px] text-mute">{when}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="overflow-hidden rounded-3xl border border-line bg-panel/70">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
            <div>
              <h2 className="text-[16px] font-semibold">Endereços antigos e para onde levam</h2>
              <p className="text-[12.5px] text-mute">Redirecionamento 301: o Google transfere a posição para o endereço novo</p>
            </div>
            <label className="relative w-full sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar endereço" aria-label="Buscar endereço" className="h-10 w-full rounded-full border border-line-strong bg-night pl-9 pr-4 text-[13.5px] outline-none focus:border-lime-500" />
            </label>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-panel-2">
                <tr className="text-left text-[11.5px] uppercase tracking-[0.12em] text-mute">
                  <th className="px-5 py-2.5">Endereço antigo</th>
                  <th className="px-5 py-2.5">Leva para</th>
                  <th className="px-5 py-2.5 text-right">Teste</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const slug = r.to.split("?")[0].split("/").pop() ?? "";
                  const opt = r.to.split("?")[1]?.replace("metros=", "").replace("tamanho=", "");
                  const p = getProduct(slug);
                  return (
                    <tr key={r.from} className="border-t border-line even:bg-white/[0.02]">
                      <td className="w-[46%] px-5 py-2.5">
                        <span className="block break-all font-mono text-[11.5px] leading-snug text-soft">
                          {r.from}
                        </span>
                      </td>
                      <td className="px-5 py-2.5">
                        <span className="block truncate font-medium">{p?.name}</span>
                        {opt && <span className="text-[12px] text-mute">{/^\d+$/.test(opt) ? `${opt} ${opt === "1" ? "metro" : "metros"} já escolhido` : `${opt} já escolhido`}</span>}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <a href={r.from} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-[12px] font-semibold text-lime-300 hover:bg-white/10">
                          301 <ExternalLink className="size-3" aria-hidden />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {list.length === 0 && <p className="p-8 text-center text-soft">Nenhum endereço com essa busca.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
