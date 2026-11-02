"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { COLORS, getProduct } from "@/lib/catalog";
import { brl } from "@/lib/format";
import type { ColorId, GarmentProduct, Product } from "@/lib/types";
import { Garment } from "./garment";
import { ProductCard } from "./product-card";
import { ButtonLink } from "./ui";

export function ShirtShowcase() {
  const shirt = getProduct("camiseta-lisa-premium") as GarmentProduct;
  const [color, setColor] = useState<ColorId>("preto");
  return (
    <div className="grid items-center gap-8 md:grid-cols-[1fr_1.05fr]">
      <div className="relative mx-auto aspect-square w-full max-w-[460px]">
        <div className="absolute inset-6 rounded-full bg-[radial-gradient(circle,rgba(143,46,230,0.45),transparent_68%)] blur-2xl" />
        <Garment key={color} shape="camiseta" color={COLORS[color].hex} className="relative h-full w-full animate-pop" />
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-ink/50 px-4 py-1.5 text-[13px] font-medium backdrop-blur-md">
          Camiseta Lisa Premium · {COLORS[color].name}
        </span>
      </div>
      <div>
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-lime-400">Novidade na DTF4U</p>
        <h2 className="text-[clamp(1.7rem,3vw,2.6rem)] font-bold leading-[1.08] tracking-[-0.02em]">Camisetas lisas para quem já imprime com a gente</h2>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-soft">
          Algodão fio 30.1 penteado, gola premium e costura reforçada. Escolha a cor, monte a grade de tamanhos e leve junto com a sua impressão DTF, num pedido só e num frete só.
        </p>
        <div className="mt-6">
          <p className="mb-2.5 text-[13px] text-mute">8 cores · toque para ver</p>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Cor da camiseta">
            {shirt.colors.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={color === c}
                aria-label={COLORS[c].name}
                onClick={() => setColor(c)}
                className={`size-10 rounded-full ring-2 ring-offset-[3px] ring-offset-ink transition duration-200 hover:scale-110 ${color === c ? "ring-lime-400" : "ring-white/10"}`}
                style={{ background: COLORS[c].hex }}
              />
            ))}
          </div>
        </div>
        <div className="mt-7 grid max-w-md grid-cols-3 overflow-hidden rounded-2xl border border-line-strong bg-panel/70 backdrop-blur-md">
          {shirt.tiers.map((t, i) => (
            <div key={t.min} className={`p-4 ${i ? "border-l border-line" : ""} ${i === 2 ? "bg-lime-500/10" : ""}`}>
              <span className="block text-[12px] text-mute">{t.max ? `${t.min} a ${t.max} peças` : `${t.min}+ peças`}</span>
              <span className={`mt-1 block text-xl font-bold tabular-nums ${i === 2 ? "text-lime-300" : ""}`}>{brl(t.price)}</span>
              <span className="text-[11.5px] text-mute">cada</span>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/produto/camiseta-lisa-premium">Montar minha grade</ButtonLink>
          <ButtonLink href="/categoria/camisetas-lisas" variant="outline">
            Ver todas as peças
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

export function ProductRail({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:mx-0 md:px-0">
        {products.map((p) => (
          <div key={p.slug} className="w-[72%] shrink-0 snap-start sm:w-[46%] md:w-[31%] lg:w-[23.5%]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={() => scroll(-1)} className="grid size-11 place-items-center rounded-full border border-line-strong text-soft transition hover:border-lime-500 hover:text-lime-300" aria-label="Produtos anteriores">
          <ChevronLeft className="size-5" />
        </button>
        <button onClick={() => scroll(1)} className="grid size-11 place-items-center rounded-full border border-line-strong text-soft transition hover:border-lime-500 hover:text-lime-300" aria-label="Próximos produtos">
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-panel/60">
      {items.map((it, i) => (
        <div key={it.q}>
          <button className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15.5px] font-semibold hover:text-lime-300" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            {it.q}
            <ChevronDown className={`size-5 shrink-0 text-mute transition-transform duration-300 ${open === i ? "rotate-180 text-lime-400" : ""}`} aria-hidden />
          </button>
          <div className={`grid transition-[grid-template-rows] duration-300 ${open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <p className="px-6 pb-5 text-[14.5px] leading-relaxed text-soft">{it.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
