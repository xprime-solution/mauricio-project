"use client";

import { ShoppingBag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { brl } from "@/lib/format";
import { cartSummary } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { CartLineRow, ShirtSuggestion } from "./cart-lines";
import { ButtonLink, useUi } from "./ui";

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUi();
  const s = useStore();
  const pathname = usePathname();
  const sum = cartSummary(s.cart);

  useEffect(() => {
    setCartOpen(false);
  }, [pathname, setCartOpen]);

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;
  return (
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label="Carrinho">
      <div className="absolute inset-0 bg-ink/65 backdrop-blur-sm animate-fade" onClick={() => setCartOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-[min(100vw,440px)] flex-col border-l border-line-strong bg-panel/92 shadow-lift backdrop-blur-2xl" style={{ animation: "slide-in .38s cubic-bezier(.2,.8,.2,1) backwards" }}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="size-5 text-lime-400" aria-hidden /> Seu carrinho
            {sum.items > 0 && <span className="text-sm font-normal text-mute">· {sum.items} {sum.items === 1 ? "item" : "itens"}</span>}
          </h2>
          <button onClick={() => setCartOpen(false)} className="grid size-9 place-items-center rounded-full text-mute hover:bg-white/8 hover:text-text" aria-label="Fechar carrinho">
            <X className="size-5" />
          </button>
        </div>
        {sum.priced.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-white/5 ring-1 ring-line">
              <ShoppingBag className="size-7 text-mute" aria-hidden />
            </span>
            <div>
              <p className="font-semibold">Seu carrinho está vazio</p>
              <p className="mt-1 text-sm text-mute">Comece pela impressão DTF ou pelas camisetas lisas.</p>
            </div>
            <ButtonLink href="/categoria/impressao-dtf" variant="outline" onClick={() => setCartOpen(false)}>
              Ver impressão DTF
            </ButtonLink>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {sum.priced.map((p) => (
                <CartLineRow key={p.line.id} p={p} compact />
              ))}
            </ul>
            <div className="space-y-4 border-t border-line bg-night/60 p-5">
              {sum.hasDtfTextil && !sum.hasGarment && <ShirtSuggestion />}
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-soft">Subtotal</span>
                <span className="text-xl font-bold tabular-nums">{brl(sum.subtotal)}</span>
              </div>
              <p className="-mt-2 text-[12.5px] text-mute">O frete é calculado pelo CEP no carrinho ou no checkout.</p>
              <div className="grid grid-cols-2 gap-2">
                <ButtonLink href="/carrinho" variant="outline">
                  Ver carrinho
                </ButtonLink>
                <ButtonLink href="/checkout">Finalizar compra</ButtonLink>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
