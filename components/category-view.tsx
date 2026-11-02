"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES, COLORS, SIZE_ORDER, fromPrice, productsIn } from "@/lib/catalog";
import type { CategorySlug, ColorId, Product, Size } from "@/lib/types";
import { ProductCard } from "./product-card";
import { Reveal } from "./motion";
import { Button } from "./ui";

type Sort = "relevancia" | "menor" | "maior" | "nome";

const kindLabel: Record<Product["kind"], string> = { metro: "Por metro", folha: "Folha avulsa", vestuario: "Peça lisa", estampa: "Estampa pronta" };

export function CategoryView({ slug }: { slug: CategorySlug }) {
  const cat = CATEGORIES.find((c) => c.slug === slug)!;
  const all = useMemo(() => productsIn(slug), [slug]);
  const garments = all.filter((p) => p.kind === "vestuario");
  const kinds = [...new Set(all.map((p) => p.kind))];
  const colors = [...new Set(garments.flatMap((p) => (p.kind === "vestuario" ? p.colors : [])))];
  const sizes = SIZE_ORDER.filter((z) => garments.some((p) => p.kind === "vestuario" && p.sizes.includes(z)));

  const [kind, setKind] = useState<Product["kind"] | "">("");
  const [color, setColor] = useState<ColorId | "">("");
  const [size, setSize] = useState<Size | "">("");
  const [sort, setSort] = useState<Sort>("relevancia");
  const [drawer, setDrawer] = useState(false);

  const list = useMemo(() => {
    let l = all.filter((p) => (!kind || p.kind === kind) && (!color || (p.kind === "vestuario" && p.colors.includes(color))) && (!size || (p.kind === "vestuario" && p.sizes.includes(size))));
    if (sort === "menor") l = [...l].sort((a, b) => fromPrice(a) - fromPrice(b));
    if (sort === "maior") l = [...l].sort((a, b) => fromPrice(b) - fromPrice(a));
    if (sort === "nome") l = [...l].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    return l;
  }, [all, kind, color, size, sort]);

  const active = [kind && kindLabel[kind], color && COLORS[color].name, size && `Tamanho ${size}`].filter(Boolean) as string[];
  const clear = () => {
    setKind("");
    setColor("");
    setSize("");
  };

  const filters = (
    <div className="space-y-7">
      {kinds.length > 1 && (
        <fieldset>
          <legend className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-mute">Tipo</legend>
          <div className="flex flex-wrap gap-2">
            {kinds.map((k) => (
              <button key={k} onClick={() => setKind(kind === k ? "" : k)} aria-pressed={kind === k} className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${kind === k ? "border-lime-500 bg-lime-500/15 text-lime-300" : "border-line-strong text-soft hover:border-white/30"}`}>
                {kindLabel[k]}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {colors.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-mute">Cor</legend>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => (
              <button key={c} onClick={() => setColor(color === c ? "" : c)} aria-pressed={color === c} aria-label={COLORS[c].name} title={COLORS[c].name} className={`size-8 rounded-full ring-2 ring-offset-2 ring-offset-ink transition hover:scale-110 ${color === c ? "ring-lime-400" : "ring-white/10"}`} style={{ background: COLORS[c].hex }} />
            ))}
          </div>
        </fieldset>
      )}
      {sizes.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-mute">Tamanho</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((z) => (
              <button key={z} onClick={() => setSize(size === z ? "" : z)} aria-pressed={size === z} className={`h-9 min-w-11 rounded-xl border px-3 text-[13px] font-semibold transition ${size === z ? "border-lime-500 bg-lime-500/15 text-lime-300" : "border-line-strong text-soft hover:border-white/30"}`}>
                {z}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-mute">Outras linhas</legend>
        <ul className="space-y-1.5 text-sm">
          {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
            <li key={c.slug}>
              <Link href={`/categoria/${c.slug}`} className="text-soft hover:text-lime-300">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        <Image src={cat.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-grape-900/40" />
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <nav className="mb-4 text-[13px] text-mute" aria-label="Você está em">
            <Link href="/" className="hover:text-lime-300">
              Início
            </Link>{" "}
            / <span className="text-soft">{cat.name}</span>
          </nav>
          <h1 className="max-w-2xl text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.05] tracking-[-0.03em] animate-rise">{cat.title}</h1>
          <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-soft animate-rise [animation-delay:90ms]">{cat.text}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-10 md:px-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{filters}</div>
        </aside>
        <div>
          <div className="sticky top-[68px] z-30 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-line bg-ink/70 px-4 py-3 backdrop-blur-xl md:static md:mx-0 md:rounded-2xl md:border md:bg-panel/60 md:px-4">
            <button onClick={() => setDrawer(true)} className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-3.5 text-[13px] font-medium lg:hidden">
              <SlidersHorizontal className="size-4" aria-hidden /> Filtros{active.length ? ` (${active.length})` : ""}
            </button>
            <span className="text-[13.5px] text-soft">
              {list.length} {list.length === 1 ? "produto" : "produtos"}
            </span>
            {active.map((a) => (
              <span key={a} className="hidden rounded-full bg-lime-500/15 px-3 py-1 text-[12.5px] font-medium text-lime-300 md:inline">
                {a}
              </span>
            ))}
            {active.length > 0 && (
              <button onClick={clear} className="text-[12.5px] font-medium text-mute underline-offset-4 hover:text-text hover:underline">
                Limpar filtros
              </button>
            )}
            <label className="ml-auto flex items-center gap-2 text-[13px] text-mute">
              Ordenar
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-9 rounded-full border border-line-strong bg-night px-3 text-[13px] text-text outline-none focus:border-lime-500">
                <option value="relevancia">Mais relevantes</option>
                <option value="menor">Menor preço</option>
                <option value="maior">Maior preço</option>
                <option value="nome">Nome</option>
              </select>
            </label>
          </div>
          {list.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
              {list.map((p, i) => (
                <Reveal key={p.slug} delay={(i % 3) * 70}>
                  <ProductCard product={p} priority={i < 3} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="grid place-items-center rounded-3xl border border-dashed border-line-strong px-6 py-20 text-center">
              <p className="font-semibold">Nenhum produto com esses filtros</p>
              <p className="mt-1 text-sm text-mute">Tente outra cor ou outro tamanho.</p>
              <Button variant="outline" className="mt-5" onClick={clear}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-fade" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl border-t border-line-strong bg-panel/95 p-6 backdrop-blur-xl animate-rise">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtros</h2>
              <button onClick={() => setDrawer(false)} className="grid size-9 place-items-center rounded-full hover:bg-white/8" aria-label="Fechar filtros">
                <X className="size-5" />
              </button>
            </div>
            {filters}
            <Button className="mt-8 w-full" onClick={() => setDrawer(false)}>
              Ver {list.length} {list.length === 1 ? "produto" : "produtos"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
