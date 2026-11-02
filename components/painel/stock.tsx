"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { COLORS, PRODUCTS, skuFor } from "@/lib/catalog";
import { relTime } from "@/lib/format";
import { setStock, testIntegration, useStore } from "@/lib/store";
import type { GarmentProduct } from "@/lib/types";
import { useNow } from "../motion";
import { Button, Spinner, useUi } from "../ui";
import { Kpi } from "./common";
import { PageHead } from "./shell";

const GARMENTS = PRODUCTS.filter((p): p is GarmentProduct => p.kind === "vestuario");

function Cell({ sku, qty }: { sku: string; qty: number }) {
  const { toast } = useUi();
  const [v, setV] = useState(String(qty));
  const [prev, setPrev] = useState(qty);
  if (prev !== qty) {
    setPrev(qty);
    setV(String(qty));
  }
  const n = Number(v);
  const tone = n === 0 ? "border-danger/50 bg-danger/10 text-danger" : n <= 5 ? "border-warn/50 bg-warn/10 text-warn" : "border-line-strong bg-night text-text";
  const commit = () => {
    const val = Math.max(0, Math.round(Number(v) || 0));
    if (val !== qty) {
      setStock(sku, val);
      toast(`${sku} atualizado para ${val} un. e enviado ao Bling`);
    }
    setV(String(val));
  };
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value.replace(/\D/g, "").slice(0, 4))}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      inputMode="numeric"
      aria-label={`Estoque ${sku}`}
      title={sku}
      className={`h-10 w-full min-w-14 rounded-xl border text-center text-[14px] font-semibold tabular-nums outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/25 ${tone}`}
    />
  );
}

export function Stock() {
  const s = useStore();
  const now = useNow(30000);
  const { toast } = useUi();
  const [slug, setSlug] = useState(GARMENTS[0].slug);
  const [syncing, setSyncing] = useState(false);
  const p = GARMENTS.find((g) => g.slug === slug)!;
  const skus = p.colors.flatMap((c) => p.sizes.map((z) => skuFor(p, c, z)));
  const units = skus.reduce((a, k) => a + (s.stock[k] ?? 0), 0);
  const out = skus.filter((k) => (s.stock[k] ?? 0) === 0).length;
  const low = skus.filter((k) => (s.stock[k] ?? 0) > 0 && (s.stock[k] ?? 0) <= 5).length;
  return (
    <>
      <PageHead
        title="Estoque"
        text="Cada cor e tamanho tem o seu SKU. O que muda aqui vai para o Bling na hora."
        action={
          <Button
            variant="outline"
            disabled={syncing}
            onClick={() => {
              setSyncing(true);
              window.setTimeout(() => {
                testIntegration("bling");
                setSyncing(false);
                toast("Estoque conferido com o Bling, sem divergências");
              }, 1100);
            }}
          >
            {syncing ? <Spinner /> : <RefreshCw className="size-4" aria-hidden />} Sincronizar com o Bling
          </Button>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist">
        {GARMENTS.map((g) => (
          <button key={g.slug} role="tab" aria-selected={slug === g.slug} onClick={() => setSlug(g.slug)} className={`rounded-full px-4 py-2 text-[13.5px] font-medium transition ${slug === g.slug ? "bg-lime-500 text-ink" : "bg-white/[0.05] text-soft hover:bg-white/10"}`}>
            {g.name}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Kpi label="SKUs deste modelo" value={skus.length} sub={`${p.colors.length} cores × ${p.sizes.length} tamanhos`} />
        <Kpi label="Peças em estoque" value={units.toLocaleString("pt-BR")} />
        <Kpi label="Esgotados" value={<span className={out ? "text-danger" : ""}>{out}</span>} sub="Aparecem como indisponíveis na loja" />
        <Kpi label="Com 5 peças ou menos" value={<span className={low ? "text-warn" : ""}>{low}</span>} sub={`Última sincronização ${s.lastSync.bling ? relTime(s.lastSync.bling, now) : ""}`} />
      </div>
      <div className="mt-6 overflow-hidden rounded-3xl border border-line bg-panel/70">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13.5px]">
            <thead>
              <tr className="bg-white/[0.04] text-left text-[11.5px] uppercase tracking-[0.12em] text-mute">
                <th className="px-5 py-3">Cor</th>
                {p.sizes.map((z) => (
                  <th key={z} className="px-2 py-3 text-center">
                    {z}
                  </th>
                ))}
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {p.colors.map((c) => {
                const row = p.sizes.reduce((a, z) => a + (s.stock[skuFor(p, c, z)] ?? 0), 0);
                return (
                  <tr key={c} className="border-t border-line">
                    <td className="px-5 py-2.5">
                      <span className="flex items-center gap-2.5">
                        <span className="size-5 shrink-0 rounded-full ring-1 ring-white/20" style={{ background: COLORS[c].hex }} />
                        <span className="font-medium">{COLORS[c].name}</span>
                        <span className="font-mono text-[11.5px] text-mute">{`${p.skuPrefix}-${COLORS[c].code}`}</span>
                      </span>
                    </td>
                    {p.sizes.map((z) => {
                      const sku = skuFor(p, c, z);
                      return (
                        <td key={z} className="px-1.5 py-2">
                          <Cell sku={sku} qty={s.stock[sku] ?? 0} />
                        </td>
                      );
                    })}
                    <td className="px-5 py-2.5 text-right font-semibold tabular-nums">{row}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="flex flex-wrap items-center gap-4 border-t border-line px-5 py-3 text-[12.5px] text-mute">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded border border-danger/50 bg-danger/10" /> Esgotado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded border border-warn/50 bg-warn/10" /> 5 peças ou menos
          </span>
          <span>Passe o mouse em uma quantidade para ver o SKU. Edite e aperte Enter para salvar.</span>
        </p>
      </div>
    </>
  );
}
