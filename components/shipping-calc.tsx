"use client";

import { Store, Truck } from "lucide-react";
import { useState } from "react";
import { brl, maskCep } from "@/lib/format";
import { lookupCep, quoteShipping } from "@/lib/shipping";
import type { ShippingQuote } from "@/lib/types";
import { Spinner } from "./ui";

export function ShippingCalc({ weight, onQuote, selected, onSelect, initialCep = "" }: { weight: number; onQuote?: (cep: string, q: ShippingQuote[]) => void; selected?: string; onSelect?: (q: ShippingQuote) => void; initialCep?: string }) {
  const [cep, setCep] = useState(initialCep);
  const [quotes, setQuotes] = useState<ShippingQuote[] | null>(() => (initialCep ? quoteShipping(initialCep, weight) : null));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const place = quotes ? lookupCep(cep) : null;

  function calc() {
    setError("");
    if (cep.replace(/\D/g, "").length !== 8) {
      setError("Digite os 8 números do CEP.");
      return;
    }
    const q = quoteShipping(cep, weight);
    if (!q) {
      setError("Não encontramos esse CEP. Confira os números.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setQuotes(q);
      onQuote?.(cep, q);
    }, 550);
  }

  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          calc();
        }}
      >
        <input
          value={cep}
          onChange={(e) => setCep(maskCep(e.target.value))}
          inputMode="numeric"
          placeholder="00000-000"
          aria-label="CEP"
          aria-invalid={!!error}
          className="h-11 w-40 rounded-full border border-line-strong bg-night px-4 text-[14.5px] tabular-nums outline-none focus:border-lime-500 aria-[invalid=true]:border-danger/70"
        />
        <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm font-semibold transition hover:border-lime-500 hover:text-lime-300">
          {loading ? <Spinner /> : <Truck className="size-4" aria-hidden />} Calcular
        </button>
      </form>
      {error && (
        <p className="mt-2 text-[12.5px] text-danger" role="alert">
          {error}
        </p>
      )}
      {quotes && !loading && (
        <div className="mt-3 animate-rise">
          {place && (
            <p className="mb-2 text-[12.5px] text-mute">
              Entrega para {place.city ? `${place.city}/` : ""}
              {place.uf}
            </p>
          )}
          <ul className="space-y-2" role={onSelect ? "radiogroup" : undefined} aria-label="Opções de frete">
            {quotes.map((q) => {
              const isSel = selected === q.id;
              const body = (
                <>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${q.price === 0 ? "bg-lime-500/15 text-lime-300" : "bg-white/6 text-soft"}`}>{q.id === "retirada" ? <Store className="size-4" aria-hidden /> : <Truck className="size-4" aria-hidden />}</span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-[13.5px] font-semibold">{q.id === "retirada" ? q.service : `${q.carrier} ${q.service}`}</span>
                    <span className="block text-[12px] text-mute">{q.days}</span>
                  </span>
                  <span className={`text-[14px] font-bold tabular-nums ${q.price === 0 ? "text-lime-300" : ""}`}>{q.price === 0 ? "Grátis" : brl(q.price)}</span>
                </>
              );
              return (
                <li key={q.id}>
                  {onSelect ? (
                    <button type="button" role="radio" aria-checked={isSel} onClick={() => onSelect(q)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 transition ${isSel ? "border-lime-500 bg-lime-500/10" : "border-line-strong bg-night/60 hover:border-white/30"}`}>
                      {body}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl border border-line bg-night/60 p-3">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
