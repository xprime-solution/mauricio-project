"use client";

import { FileImage, Shirt, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { COLORS, getProduct, parseSku, skuFor } from "@/lib/catalog";
import { brl } from "@/lib/format";
import type { PricedLine } from "@/lib/pricing";
import { addToCart, removeLine, setQty, useStore } from "@/lib/store";
import type { ColorId, GarmentProduct, Size } from "@/lib/types";
import { ProductMedia } from "./product-media";
import { Button, QtyStepper, useUi } from "./ui";

export function CartLineRow({ p, compact }: { p: PricedLine; compact?: boolean }) {
  const { toast } = useUi();
  const [confirm, setConfirm] = useState(false);
  const color = p.product.kind === "vestuario" ? parseSku(p.line.option)?.color : undefined;
  const tierNote =
    p.product.kind === "vestuario" && p.modelQty
      ? p.modelQty >= 50
        ? "Preço de 50+ peças aplicado"
        : p.modelQty >= 12
          ? "Preço de 12+ peças aplicado"
          : `Faltam ${12 - p.modelQty} peças para o preço de 12+`
      : null;
  return (
    <li className="flex gap-3.5 py-4">
      <Link href={`/produto/${p.product.slug}`} className="group relative size-20 shrink-0 overflow-hidden rounded-2xl bg-night ring-1 ring-line">
        <ProductMedia product={p.product} color={color} sizes="80px" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/produto/${p.product.slug}`} className="block truncate text-[14.5px] font-semibold hover:text-lime-300">
              {p.product.name}
            </Link>
            <p className="text-[13px] text-soft">{p.label}</p>
          </div>
          <span className="shrink-0 text-[15px] font-bold tabular-nums">{brl(p.total)}</span>
        </div>
        {p.line.arts?.length ? (
          <p className="mt-1 flex items-center gap-1.5 truncate text-[12.5px] text-mute">
            <FileImage className="size-3.5 shrink-0 text-lime-400" aria-hidden />
            {p.line.arts.length === 1 ? p.line.arts[0].name : `${p.line.arts.length} artes enviadas`}
          </p>
        ) : null}
        {tierNote && <p className={`mt-1 text-[12.5px] ${p.modelQty! >= 12 ? "text-lime-300" : "text-warn"}`}>{tierNote}</p>}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <QtyStepper size="sm" value={p.line.qty} onChange={(v) => setQty(p.line.id, v)} label={`Quantidade de ${p.product.name}`} />
            {!compact && <span className="text-[12.5px] text-mute">{brl(p.unit)} cada</span>}
          </div>
          {confirm ? (
            <span className="flex items-center gap-1.5 text-[12.5px]">
              Remover?
              <button
                className="rounded-full bg-danger/15 px-2.5 py-1 font-semibold text-danger hover:bg-danger/25"
                onClick={() => {
                  removeLine(p.line.id);
                  toast(`${p.product.name} removido do carrinho`);
                }}
              >
                Sim
              </button>
              <button className="rounded-full px-2.5 py-1 text-soft hover:bg-white/8" onClick={() => setConfirm(false)}>
                Não
              </button>
            </span>
          ) : (
            <button onClick={() => setConfirm(true)} className="grid size-8 place-items-center rounded-full text-mute hover:bg-danger/10 hover:text-danger" aria-label={`Remover ${p.product.name}`}>
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/** Sugestão de camiseta lisa para quem leva DTF e ainda não tem peça no carrinho. */
export function ShirtSuggestion() {
  const s = useStore();
  const { toast } = useUi();
  const shirt = getProduct("camiseta-lisa-premium") as GarmentProduct;
  const [color, setColor] = useState<ColorId>("preto");
  const [size, setSize] = useState<Size>("M");
  const [qty, setQ] = useState(12);
  const sku = skuFor(shirt, color, size);
  const left = s.stock[sku] ?? 0;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-lime-500/30 bg-gradient-to-br from-grape-900/70 to-panel p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime-500 text-ink">
          <Shirt className="size-4.5" aria-hidden />
        </span>
        <div>
          <p className="text-[14px] font-semibold">Vai aplicar em camiseta?</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-soft">
            Leve a Camiseta Lisa Premium no mesmo pedido. A partir de 12 peças cada uma sai por {brl(shirt.tiers[1].price)}.
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex gap-1" role="radiogroup" aria-label="Cor">
          {shirt.colors.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={color === c}
              aria-label={COLORS[c].name}
              onClick={() => setColor(c)}
              className={`size-6 rounded-full ring-2 ring-offset-2 ring-offset-panel transition ${color === c ? "ring-lime-400" : "ring-transparent hover:ring-white/30"}`}
              style={{ background: COLORS[c].hex }}
            />
          ))}
        </div>
        <select value={size} onChange={(e) => setSize(e.target.value as Size)} aria-label="Tamanho" className="h-9 rounded-full border border-line-strong bg-night px-3 text-sm outline-none focus:border-lime-500">
          {shirt.sizes.map((z) => (
            <option key={z} value={z} disabled={(s.stock[skuFor(shirt, color, z)] ?? 0) === 0}>
              {z}
              {(s.stock[skuFor(shirt, color, z)] ?? 0) === 0 ? " · esgotado" : ""}
            </option>
          ))}
        </select>
        <QtyStepper size="sm" value={qty} onChange={setQ} max={Math.max(1, left)} label="Quantidade de camisetas" />
        <Button
          size="sm"
          disabled={left === 0}
          onClick={() => {
            addToCart([{ slug: shirt.slug, option: sku, qty: Math.min(qty, left) }]);
            toast(`${Math.min(qty, left)} camisetas ${COLORS[color].name.toLowerCase()} ${size} adicionadas`);
          }}
        >
          Adicionar
        </Button>
      </div>
      {left === 0 && <p className="mt-2 text-[12.5px] text-warn">Esse tamanho acabou nessa cor. Escolha outro tamanho ou outra cor.</p>}
    </div>
  );
}
