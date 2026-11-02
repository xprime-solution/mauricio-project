import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { COLORS, fromPrice } from "@/lib/catalog";
import { brl } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductMedia } from "./product-media";

function priceLine(p: Product) {
  switch (p.kind) {
    case "metro":
      return { lead: "1 metro por", value: brl(p.prices[0]) };
    case "folha":
    case "estampa":
      return { lead: "A partir de", value: brl(fromPrice(p)) };
    case "vestuario":
      return { lead: "A partir de", value: brl(fromPrice(p)), note: `${brl(p.tiers[0].price)} a unidade` };
  }
}

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const price = priceLine(product);
  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-panel shadow-card transition duration-300 hover:-translate-y-1 hover:border-grape-500/50 hover:shadow-lift"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-night">
        <ProductMedia product={product} priority={priority} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-panel/90 to-transparent" />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-ink/45 px-3 py-1 text-[11.5px] font-semibold text-white backdrop-blur-md">{product.badge}</span>
        )}
        <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-white/15 bg-ink/40 text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
        {product.kind === "vestuario" && (
          <div className="absolute bottom-3 left-3 flex -space-x-1.5">
            {product.colors.slice(0, 8).map((c) => (
              <span key={c} className="size-4 rounded-full ring-2 ring-panel" style={{ background: COLORS[c].hex }} title={COLORS[c].name} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em]">{product.name}</h3>
        <p className="line-clamp-1 text-[13px] text-mute">{product.short}</p>
        <div className="mt-auto pt-3">
          <span className="block text-[11.5px] text-mute">{price.lead}</span>
          <span className="text-lg font-bold tracking-[-0.01em] text-lime-400">{price.value}</span>
          {price.note && <span className="ml-2 text-[12px] text-mute">· {price.note}</span>}
        </div>
      </div>
    </Link>
  );
}
