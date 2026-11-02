import { getProduct, optionLabel, tierPrice } from "./catalog";
import type { CartLine, Product } from "./types";

export interface PricedLine {
  line: CartLine;
  product: Product;
  label: string;
  unit: number;
  total: number;
  weight: number;
  /** quantidade total do mesmo modelo no carrinho (define a faixa de preço) */
  modelQty?: number;
}

export function priceLines(lines: CartLine[]): PricedLine[] {
  const modelQty = new Map<string, number>();
  for (const l of lines) {
    const p = getProduct(l.slug);
    if (p?.kind === "vestuario") modelQty.set(p.slug, (modelQty.get(p.slug) ?? 0) + l.qty);
  }
  const out: PricedLine[] = [];
  for (const line of lines) {
    const product = getProduct(line.slug);
    if (!product) continue;
    let unit = 0;
    let weight = product.weight * line.qty;
    switch (product.kind) {
      case "metro": {
        const m = Number(line.option);
        unit = product.prices[m - 1] ?? 0;
        weight = product.weight * m * line.qty;
        break;
      }
      case "folha":
      case "estampa":
        unit = product.sizes.find((s) => s.id === line.option)?.price ?? 0;
        break;
      case "vestuario":
        unit = tierPrice(product, modelQty.get(product.slug) ?? line.qty);
        break;
    }
    out.push({
      line,
      product,
      label: optionLabel(product, line.option),
      unit,
      total: Math.round(unit * line.qty * 100) / 100,
      weight,
      modelQty: product.kind === "vestuario" ? modelQty.get(product.slug) : undefined,
    });
  }
  return out;
}

export function cartSummary(lines: CartLine[]) {
  const priced = priceLines(lines);
  const subtotal = Math.round(priced.reduce((a, p) => a + p.total, 0) * 100) / 100;
  const weight = priced.reduce((a, p) => a + p.weight, 0);
  const items = lines.reduce((a, l) => a + l.qty, 0);
  const hasDtfTextil = priced.some((p) => p.product.category === "impressao-dtf" || p.product.category === "estampas");
  const hasGarment = priced.some((p) => p.product.kind === "vestuario");
  return { priced, subtotal, weight, items, hasDtfTextil, hasGarment };
}
