"use client";

import { Check, ChevronRight, Ruler, ShieldCheck, Shirt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, COLORS, getProduct, skuFor, tierPrice } from "@/lib/catalog";
import { brl } from "@/lib/format";
import { addToCart, track, useStore } from "@/lib/store";
import type { ArtFile, ColorId, DesignProduct, GarmentProduct, MetroProduct, Product, SheetProduct, Size } from "@/lib/types";
import { ArtUpload } from "./art-upload";
import { DesignArt } from "./estampas";
import { Garment } from "./garment";
import { useHydrated } from "./motion";
import { ProductCard } from "./product-card";
import { ShippingCalc } from "./shipping-calc";
import { Button, Modal, QtyStepper, useUi } from "./ui";

/* ---------- galeria ---------- */

type Slide = { kind: "photo"; src: string } | { kind: "garment"; color: ColorId } | { kind: "design" } | { kind: "design-on"; color: ColorId };

function Gallery({ product, slides, active, setActive }: { product: Product; slides: Slide[]; active: number; setActive: (i: number) => void }) {
  const render = (s: Slide, big: boolean) => {
    if (s.kind === "photo") return <Image src={s.src} alt={product.name} fill priority={big} sizes={big ? "(max-width: 1024px) 92vw, 50vw" : "88px"} className="object-cover" />;
    if (s.kind === "garment" && product.kind === "vestuario")
      return (
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_38%,#4a3f5a,#1b1722_74%)]">
          <Garment key={s.color} shape={product.shape} color={COLORS[s.color].hex} className={`h-[86%] w-[86%] ${big ? "animate-pop" : ""}`} />
        </div>
      );
    if (product.kind === "estampa" && s.kind === "design")
      return (
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_40%,#2b0b49,#141119_70%)]">
          <DesignArt id={product.design} className="h-[78%] w-[78%]" />
        </div>
      );
    if (product.kind === "estampa" && s.kind === "design-on")
      return (
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_38%,#4a3f5a,#1b1722_74%)]">
          <Garment key={s.color} shape="camiseta" color={COLORS[s.color].hex} className={`h-[86%] w-[86%] ${big ? "animate-pop" : ""}`}>
            <DesignArt id={product.design} embed={{ x: 130, y: 104, size: 140 }} />
          </Garment>
        </div>
      );
    return null;
  };
  return (
    <div className="min-w-0 lg:sticky lg:top-24">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-line bg-night shadow-card">
        {render(slides[active] ?? slides[0], true)}
        {product.badge && <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-ink/45 px-3 py-1 text-[12px] font-semibold backdrop-blur-md">{product.badge}</span>}
      </div>
      {slides.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto">
          {slides.map((s, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`Imagem ${i + 1}`} aria-current={active === i} className={`relative size-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-night transition ${active === i ? "border-lime-500" : "border-transparent opacity-70 hover:opacity-100"}`}>
              {render(s, false)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- blocos de compra ---------- */

function useAdded() {
  const { setCartOpen, toast } = useUi();
  return (msg: string) => {
    toast(msg);
    window.setTimeout(() => setCartOpen(true), 250);
  };
}

function MetroBuy({ p, initial }: { p: MetroProduct; initial?: number }) {
  const [m, setM] = useState(initial && initial >= 1 && initial <= 10 ? initial : 1);
  const [qty, setQty] = useState(1);
  const [arts, setArts] = useState<ArtFile[]>([]);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [k, setK] = useState(0);
  const added = useAdded();
  const price = p.prices[m - 1];
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-[13px] font-semibold text-soft">Metragem do filme{p.width ? ` · largura de ${p.width}` : ""}</span>
          <span className="text-[12.5px] text-mute">{brl(price / m)} por metro</span>
        </div>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Metragem">
          {p.prices.map((v, i) => (
            <button key={i} role="radio" aria-checked={m === i + 1} onClick={() => setM(i + 1)} className={`rounded-2xl border px-1 py-2.5 text-center transition ${m === i + 1 ? "border-lime-500 bg-lime-500/12 shadow-glow" : "border-line-strong bg-night/60 hover:border-white/30"}`}>
              <span className="block text-[15px] font-bold">{i + 1} m</span>
              <span className={`block text-[11.5px] tabular-nums ${m === i + 1 ? "text-lime-300" : "text-mute"}`}>{brl(v)}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="mb-2.5 block text-[13px] font-semibold text-soft">Sua arte</span>
        <ArtUpload key={k} value={arts} onChange={(a) => { setArts(a); if (a.length) setErr(""); }} error={err} />
      </div>
      <label className="block">
        <span className="mb-2 block text-[13px] font-semibold text-soft">
          Observações para a produção <span className="font-normal text-mute">(opcional)</span>
        </span>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 300))} rows={2} placeholder="Ex.: imprimir as artes na ordem dos arquivos" className="w-full rounded-2xl border border-line-strong bg-night px-4 py-3 text-[14px] outline-none placeholder:text-mute/70 focus:border-lime-500" />
      </label>
      <BuyBar
        total={price * qty}
        detail={`${m} ${m === 1 ? "metro" : "metros"}${qty > 1 ? ` × ${qty} filmes` : ""}`}
        qty={qty}
        setQty={setQty}
        qtyLabel="Filmes"
        onAdd={() => {
          if (!arts.length) {
            setErr("Envie pelo menos 1 arquivo da arte para adicionar ao carrinho.");
            return;
          }
          addToCart([{ slug: p.slug, option: String(m), qty, arts, note: note.trim() || undefined }]);
          added(`${p.name} · ${m} ${m === 1 ? "metro" : "metros"} adicionado ao carrinho`);
          setArts([]);
          setNote("");
          setQty(1);
          setK((x) => x + 1);
        }}
      />
    </div>
  );
}

function SizeBuy({ p, needsArt, initial }: { p: SheetProduct | DesignProduct; needsArt: boolean; initial?: string }) {
  const [size, setSize] = useState<"A4" | "A3">(initial === "A3" ? "A3" : "A4");
  const [qty, setQty] = useState(1);
  const [arts, setArts] = useState<ArtFile[]>([]);
  const [err, setErr] = useState("");
  const [k, setK] = useState(0);
  const added = useAdded();
  const price = p.sizes.find((s) => s.id === size)!.price;
  return (
    <div className="space-y-6">
      <div>
        <span className="mb-2.5 block text-[13px] font-semibold text-soft">Tamanho</span>
        <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Tamanho">
          {p.sizes.map((s) => (
            <button key={s.id} role="radio" aria-checked={size === s.id} onClick={() => setSize(s.id)} className={`rounded-2xl border p-3.5 text-left transition ${size === s.id ? "border-lime-500 bg-lime-500/12 shadow-glow" : "border-line-strong bg-night/60 hover:border-white/30"}`}>
              <span className="block text-[16px] font-bold">{s.id}</span>
              <span className="block text-[12px] text-mute">{s.label.split(" · ")[1]}</span>
              <span className={`mt-1 block text-[14px] font-semibold tabular-nums ${size === s.id ? "text-lime-300" : ""}`}>{brl(s.price)}</span>
            </button>
          ))}
        </div>
      </div>
      {needsArt && (
        <div>
          <span className="mb-2.5 block text-[13px] font-semibold text-soft">Sua arte</span>
          <ArtUpload key={k} value={arts} onChange={(a) => { setArts(a); if (a.length) setErr(""); }} error={err} />
        </div>
      )}
      <BuyBar
        total={price * qty}
        detail={`${size} × ${qty} ${qty === 1 ? "unidade" : "unidades"}`}
        qty={qty}
        setQty={setQty}
        qtyLabel="Unidades"
        onAdd={() => {
          if (needsArt && !arts.length) {
            setErr("Envie pelo menos 1 arquivo da arte para adicionar ao carrinho.");
            return;
          }
          addToCart([{ slug: p.slug, option: size, qty, arts: needsArt ? arts : undefined }]);
          added(`${p.name} ${size} adicionada ao carrinho`);
          setArts([]);
          setQty(1);
          setK((x) => x + 1);
        }}
      />
    </div>
  );
}

const MEASURES: Record<GarmentProduct["shape"], { size: Size; w: number; h: number }[]> = {
  camiseta: [
    { size: "P", w: 50, h: 70 },
    { size: "M", w: 53, h: 72 },
    { size: "G", w: 56, h: 74 },
    { size: "GG", w: 59, h: 76 },
    { size: "G1", w: 62, h: 78 },
    { size: "G2", w: 65, h: 80 },
    { size: "G3", w: 68, h: 82 },
  ],
  polo: [
    { size: "P", w: 51, h: 69 },
    { size: "M", w: 54, h: 71 },
    { size: "G", w: 57, h: 73 },
    { size: "GG", w: 60, h: 75 },
  ],
  moletom: [
    { size: "P", w: 54, h: 66 },
    { size: "M", w: 57, h: 68 },
    { size: "G", w: 60, h: 70 },
    { size: "GG", w: 63, h: 72 },
    { size: "G1", w: 66, h: 74 },
    { size: "G2", w: 69, h: 76 },
    { size: "G3", w: 72, h: 78 },
  ],
};

function GarmentBuy({ p, color, setColor }: { p: GarmentProduct; color: ColorId; setColor: (c: ColorId) => void }) {
  const s = useStore();
  const hydrated = useHydrated();
  const added = useAdded();
  const [grid, setGrid] = useState<Partial<Record<Size, number>>>({});
  const [measures, setMeasures] = useState(false);
  const [err, setErr] = useState("");
  const stockOf = (z: Size) => (hydrated ? (s.stock[skuFor(p, color, z)] ?? 0) : null);
  const inCart = s.cart.filter((l) => l.slug === p.slug).reduce((a, l) => a + l.qty, 0);
  const pieces = Object.values(grid).reduce((a, n) => a + (n || 0), 0);
  const modelTotal = pieces + (hydrated ? inCart : 0);
  const unit = tierPrice(p, Math.max(1, modelTotal));
  const tierIdx = p.tiers.findIndex((t) => modelTotal >= t.min && (t.max === null || modelTotal <= t.max));

  const setSize = (z: Size, n: number) => {
    const max = stockOf(z) ?? 999;
    setGrid((g) => ({ ...g, [z]: Math.max(0, Math.min(max, n)) }));
    setErr("");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-[13px] font-semibold text-soft">
            Cor: <span className="text-text">{COLORS[color].name}</span>
          </span>
          <span className="text-[12px] text-mute">{p.colors.length} cores</span>
        </div>
        <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Cor">
          {p.colors.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={color === c}
              aria-label={COLORS[c].name}
              title={COLORS[c].name}
              onClick={() => {
                setColor(c);
                setGrid({});
              }}
              className={`size-10 rounded-full ring-2 ring-offset-[3px] ring-offset-ink transition hover:scale-110 ${color === c ? "ring-lime-400" : "ring-white/10"}`}
              style={{ background: COLORS[c].hex }}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-soft">Grade de tamanhos</span>
          <button onClick={() => setMeasures(true)} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-lime-300 hover:text-lime-400">
            <Ruler className="size-3.5" aria-hidden /> Tabela de medidas
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-line-strong">
          {p.sizes.map((z, i) => {
            const st = stockOf(z);
            const out = st === 0;
            const v = grid[z] ?? 0;
            return (
              <div key={z} className={`flex items-center gap-3 px-3.5 py-2.5 ${i ? "border-t border-line" : ""} ${out ? "bg-white/[0.02]" : v ? "bg-lime-500/[0.06]" : ""}`}>
                <span className={`w-10 text-[15px] font-bold ${out ? "text-mute line-through" : ""}`}>{z}</span>
                <span className="flex-1 text-[12.5px]">
                  {st === null ? <span className="skeleton inline-block h-3 w-20 rounded" /> : out ? <span className="text-mute">Esgotado nessa cor</span> : st <= 5 ? <span className="text-warn">Últimas {st} peças</span> : <span className="text-mute">{st} em estoque</span>}
                </span>
                {out ? (
                  <span className="text-[12px] text-mute">Indisponível</span>
                ) : (
                  <QtyStepper size="sm" min={0} max={st ?? 999} value={v} onChange={(n) => setSize(z, n)} label={`Peças tamanho ${z}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line-strong">
        {p.tiers.map((t, i) => (
          <div key={t.min} className={`relative p-3 text-center transition ${i ? "border-l border-line" : ""} ${tierIdx === i && modelTotal > 0 ? "bg-lime-500/12" : ""}`}>
            {tierIdx === i && modelTotal > 0 && (
              <span className="absolute right-2 top-2 grid size-4 place-items-center rounded-full bg-lime-500 text-ink">
                <Check className="size-3" aria-hidden />
              </span>
            )}
            <span className="block text-[11.5px] text-mute">{t.max ? `${t.min} a ${t.max}` : `${t.min}+`} peças</span>
            <span className={`block text-[16px] font-bold tabular-nums ${tierIdx === i && modelTotal > 0 ? "text-lime-300" : ""}`}>{brl(t.price)}</span>
          </div>
        ))}
      </div>
      {hydrated && inCart > 0 && <p className="-mt-3 text-[12.5px] text-mute">Você já tem {inCart} {inCart === 1 ? "peça" : "peças"} deste modelo no carrinho. Elas contam para a faixa de preço.</p>}
      {modelTotal > 0 && modelTotal < 12 && <p className="-mt-3 text-[12.5px] text-warn">Faltam {12 - modelTotal} peças para cada uma sair por {brl(p.tiers[1].price)}.</p>}

      <BuyBar
        total={unit * pieces}
        detail={pieces ? `${pieces} ${pieces === 1 ? "peça" : "peças"} × ${brl(unit)}` : "Escolha as quantidades por tamanho"}
        onAdd={() => {
          const lines = (Object.entries(grid) as [Size, number][]).filter(([, n]) => n > 0).map(([z, n]) => ({ slug: p.slug, option: skuFor(p, color, z), qty: n }));
          if (!lines.length) {
            setErr("Informe a quantidade de pelo menos 1 tamanho.");
            return;
          }
          addToCart(lines);
          added(`${pieces} ${p.name.toLowerCase()} ${COLORS[color].name.toLowerCase()} adicionadas ao carrinho`);
          setGrid({});
        }}
        error={err}
      />

      <Modal open={measures} onClose={() => setMeasures(false)} title={`Tabela de medidas · ${p.name}`}>
        <p className="mb-4 text-sm text-soft">Medidas da peça estendida, em centímetros. Compare com uma peça que você já usa.</p>
        <table className="w-full overflow-hidden rounded-2xl text-sm">
          <thead>
            <tr className="bg-white/6 text-left text-[12px] uppercase tracking-[0.12em] text-mute">
              <th className="px-4 py-2.5">Tamanho</th>
              <th className="px-4 py-2.5">Largura</th>
              <th className="px-4 py-2.5">Comprimento</th>
            </tr>
          </thead>
          <tbody>
            {MEASURES[p.shape]
              .filter((m) => p.sizes.includes(m.size))
              .map((m) => (
                <tr key={m.size} className="border-t border-line even:bg-white/[0.03]">
                  <td className="px-4 py-2.5 font-bold">{m.size}</td>
                  <td className="px-4 py-2.5 tabular-nums">{m.w} cm</td>
                  <td className="px-4 py-2.5 tabular-nums">{m.h} cm</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Modal>
    </div>
  );
}

function BuyBar({ total, detail, qty, setQty, qtyLabel, onAdd, error }: { total: number; detail: string; qty?: number; setQty?: (n: number) => void; qtyLabel?: string; onAdd: () => void; error?: string }) {
  return (
    <div className="rounded-3xl border border-line-strong bg-panel/80 p-4 backdrop-blur-md">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="block text-[12px] text-mute">Total</span>
          <span className="text-[1.9rem] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-lime-300">{brl(total)}</span>
          <span className="mt-1 block text-[12.5px] text-mute">{detail}</span>
        </div>
        {qty !== undefined && setQty && (
          <div className="text-right">
            <span className="mb-1 block text-[12px] text-mute">{qtyLabel}</span>
            <QtyStepper value={qty} onChange={setQty} label={qtyLabel} />
          </div>
        )}
      </div>
      <Button size="lg" className="mt-4 w-full" onClick={onAdd}>
        Adicionar ao carrinho
      </Button>
      {error && (
        <p className="mt-2 text-center text-[12.5px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- página ---------- */

export function ProductView({ slug, metros, tamanho }: { slug: string; metros?: number; tamanho?: string }) {
  const product = getProduct(slug)!;
  const cat = CATEGORIES.find((c) => c.slug === product.category)!;
  const [color, setColor] = useState<ColorId>(product.kind === "vestuario" ? (product.colors.includes("preto") ? "preto" : product.colors[0]) : "preto");
  const [active, setActive] = useState(0);
  const s = useStore();

  useEffect(() => {
    track("ViewContent");
  }, [slug]);

  const slides: Slide[] = useMemo(() => {
    if (product.kind === "vestuario") return [{ kind: "garment", color }, ...product.images.map((src) => ({ kind: "photo" as const, src }))];
    if (product.kind === "estampa") return [{ kind: "design" }, ...(["preto", "branco", "azul-marinho", "vermelho"] as ColorId[]).map((c) => ({ kind: "design-on" as const, color: c }))];
    return product.images.map((src) => ({ kind: "photo" as const, src }));
  }, [product, color]);

  const weight = product.kind === "metro" ? product.weight * (metros || 1) : product.kind === "vestuario" ? product.weight * 12 : product.weight * 10;
  const related = useMemo(() => {
    const pool =
      product.category === "impressao-dtf"
        ? ["camiseta-lisa-premium", "estampa-tigre-neon", "camisa-polo", "dtf-uv"]
        : product.kind === "vestuario"
          ? ["dtf-textil-60cm", "estampa-onda-itajai", "folha-dtf-textil", "moletom-canguru-premium", "camiseta-lisa-premium"]
          : ["dtf-textil-60cm", "camiseta-lisa-premium", "folha-dtf-uv", "estampa-game-over", "dtf-uv"];
    return pool
      .filter((x) => x !== product.slug)
      .map((x) => getProduct(x))
      .filter((x): x is Product => !!x)
      .slice(0, 4);
  }, [product]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[13px] text-mute" aria-label="Você está em">
        <Link href="/" className="hover:text-lime-300">
          Início
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href={`/categoria/${cat.slug}`} className="hover:text-lime-300">
          {cat.name}
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-soft">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <Gallery product={product} slides={slides} active={Math.min(active, slides.length - 1)} setActive={setActive} />
        <div className="min-w-0">
          <h1 className="text-[clamp(1.9rem,3.4vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">{product.name}</h1>
          <p className="mt-2 text-[15px] text-soft">{product.short}</p>
          <div className="mt-8">
            {product.kind === "metro" && <MetroBuy p={product} initial={metros} />}
            {product.kind === "folha" && <SizeBuy p={product} needsArt initial={tamanho} />}
            {product.kind === "estampa" && <SizeBuy p={product} needsArt={false} initial={tamanho} />}
            {product.kind === "vestuario" && (
              <GarmentBuy
                p={product}
                color={color}
                setColor={(c) => {
                  setColor(c);
                  setActive(0);
                }}
              />
            )}
          </div>

          <div className="mt-8 rounded-3xl border border-line bg-panel/50 p-5">
            <h2 className="mb-3 text-[14px] font-semibold">Calcule o frete e o prazo</h2>
            <ShippingCalc weight={weight} initialCep={s.ready && s.session?.address.cep ? s.session.address.cep : ""} key={s.ready && s.session ? "logado" : "anon"} />
          </div>

          <div className="mt-8 space-y-3 text-[14.5px] leading-relaxed text-soft">
            {product.description.map((d) => (
              <p key={d}>{d}</p>
            ))}
          </div>
          {product.kind === "vestuario" && (
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {product.features.map((f) => (
                <li key={f.title} className="rounded-2xl border border-line bg-panel/60 p-4">
                  <Shirt className="mb-2 size-5 text-lime-400" aria-hidden />
                  <span className="block text-[14px] font-semibold">{f.title}</span>
                  <span className="block text-[12.5px] text-mute">{f.text}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-6 flex items-center gap-2 text-[13px] text-mute">
            <ShieldCheck className="size-4 text-lime-400" aria-hidden /> Pagamento protegido pelo Mercado Pago · Pix, cartão em até 3x ou boleto
          </p>
        </div>
      </div>

      <section className="pt-20">
        <h2 className="mb-6 text-2xl font-bold tracking-[-0.02em]">{product.category === "impressao-dtf" ? "Para aplicar a sua impressão" : "Combine no mesmo pedido"}</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
          {related.map((r) => (
            <ProductCard key={r.slug} product={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
