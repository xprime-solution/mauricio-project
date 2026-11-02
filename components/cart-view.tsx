"use client";

import { ArrowRight, Lock, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { brl } from "@/lib/format";
import { cartSummary } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import type { ShippingQuote } from "@/lib/types";
import { CartLineRow, ShirtSuggestion } from "./cart-lines";
import { useHydrated } from "./motion";
import { ShippingCalc } from "./shipping-calc";
import { ButtonLink } from "./ui";

export function CartView() {
  const s = useStore();
  const hydrated = useHydrated();
  const sum = cartSummary(s.cart);
  const [ship, setShip] = useState<ShippingQuote | null>(null);

  if (!hydrated || !s.ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        <div className="skeleton h-10 w-56 rounded-xl" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="skeleton h-72 rounded-3xl" />
          <div className="skeleton h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!sum.priced.length) {
    return (
      <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-white/5 ring-1 ring-line">
          <ShoppingBag className="size-8 text-mute" aria-hidden />
        </span>
        <h1 className="mt-6 text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-soft">Escolha a sua impressão DTF ou monte uma grade de camisetas lisas.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/produto/dtf-textil-60cm">Comprar DTF por metro</ButtonLink>
          <ButtonLink href="/categoria/camisetas-lisas" variant="outline">
            Ver camisetas lisas
          </ButtonLink>
        </div>
      </div>
    );
  }

  const total = sum.subtotal + (ship?.price ?? 0);
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
      <h1 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-[-0.03em]">Seu carrinho</h1>
      <p className="mt-1 text-soft">
        {sum.items} {sum.items === 1 ? "item" : "itens"} · tudo segue num pedido só, com um frete só
      </p>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <ul className="divide-y divide-line rounded-3xl border border-line bg-panel/60 px-5">
            {sum.priced.map((p) => (
              <CartLineRow key={p.line.id} p={p} />
            ))}
          </ul>
          {sum.hasDtfTextil && !sum.hasGarment && <ShirtSuggestion />}
        </div>
        <aside className="space-y-5 rounded-3xl border border-line-strong bg-panel/80 p-6 backdrop-blur-md lg:sticky lg:top-24">
          <div>
            <h2 className="mb-3 text-[15px] font-semibold">Frete</h2>
            <ShippingCalc weight={sum.weight} selected={ship?.id} onSelect={setShip} onQuote={(_, q) => setShip(q[0])} initialCep={s.session?.address.cep ?? ""} />
          </div>
          <dl className="space-y-2 border-t border-line pt-4 text-[14.5px]">
            <div className="flex justify-between">
              <dt className="text-soft">Subtotal</dt>
              <dd className="tabular-nums">{brl(sum.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-soft">Frete</dt>
              <dd className="tabular-nums">{ship ? (ship.price ? brl(ship.price) : "Grátis") : "Informe o CEP"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="text-2xl font-extrabold tabular-nums text-lime-300">{brl(total)}</dd>
            </div>
          </dl>
          <ButtonLink href="/checkout" size="lg" className="w-full">
            Finalizar compra <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <p className="flex items-center justify-center gap-1.5 text-[12.5px] text-mute">
            <Lock className="size-3.5" aria-hidden /> Pagamento protegido pelo Mercado Pago
          </p>
        </aside>
      </div>
    </div>
  );
}
