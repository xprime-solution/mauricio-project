"use client";

import { Barcode, CreditCard, Lock, QrCode, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type ReactNode } from "react";
import { brl, maskCard, maskCep, maskDoc, maskExpiry, maskPhone, onlyDigits } from "@/lib/format";
import { cartSummary } from "@/lib/pricing";
import { lookupCep, quoteShipping } from "@/lib/shipping";
import { placeOrder, useStore } from "@/lib/store";
import type { Address, PaymentMethod, ShippingQuote } from "@/lib/types";
import { cardBrand, isDoc, isEmail, isPhone, luhn, validExpiry } from "@/lib/validation";
import { useHydrated } from "./motion";
import { ProductMedia } from "./product-media";
import { parseSku } from "@/lib/catalog";
import { Button, ButtonLink, Field, Input, Spinner } from "./ui";

const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

type Errors = Partial<Record<string, string>>;

function Section({ n, title, children, aside }: { n: number; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-panel/60 p-5 md:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-[17px] font-semibold">
          <span className="grid size-8 place-items-center rounded-full bg-lime-500 text-[14px] font-bold text-ink">{n}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const s = useStore();
  const hydrated = useHydrated();
  if (!hydrated || !s.ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="skeleton h-[520px] rounded-3xl" />
          <div className="skeleton h-80 rounded-3xl" />
        </div>
      </div>
    );
  }
  if (!s.cart.length) {
    return (
      <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
        <ShoppingBag className="size-10 text-mute" aria-hidden />
        <h1 className="mt-5 text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-soft">Adicione produtos para finalizar a compra.</p>
        <ButtonLink href="/" className="mt-6">
          Voltar para a loja
        </ButtonLink>
      </div>
    );
  }
  return <CheckoutForm key={s.session?.email ?? "visitante"} />;
}

function CheckoutForm() {
  const s = useStore();
  const router = useRouter();
  const sum = cartSummary(s.cart);
  const sess = s.session;

  const [name, setName] = useState(sess?.name ?? "");
  const [email, setEmail] = useState(sess?.email ?? "");
  const [phone, setPhone] = useState(sess?.phone ?? "");
  const [doc, setDoc] = useState(sess?.doc ?? "");
  const [company, setCompany] = useState(sess?.company ?? "");
  const [addr, setAddr] = useState<Address>(sess?.address ?? { cep: "", street: "", number: "", complement: "", district: "", city: "", uf: "" });
  const [quotes, setQuotes] = useState<ShippingQuote[] | null>(() => (sess?.address.cep ? quoteShipping(sess.address.cep, sum.weight) : null));
  const [ship, setShip] = useState<ShippingQuote | null>(() => (sess?.address.cep ? (quoteShipping(sess.address.cep, sum.weight)?.find((q) => q.id === "jadlog") ?? null) : null));
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "", installments: 1 });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  const total = Math.round((sum.subtotal + (ship?.price ?? 0)) * 100) / 100;
  const maxInst = total >= 300 ? 3 : total >= 150 ? 2 : 1;

  function onCep(v: string) {
    const cep = maskCep(v);
    const next = { ...addr, cep };
    if (onlyDigits(cep).length === 8) {
      const place = lookupCep(cep);
      if (place) {
        next.uf = place.uf;
        if (place.city) next.city = place.city;
        const q = quoteShipping(cep, sum.weight);
        setQuotes(q);
        setShip(q?.find((x) => x.id === "jadlog") ?? q?.[0] ?? null);
        setErrors((e) => ({ ...e, cep: undefined, ship: undefined }));
      } else {
        setQuotes(null);
        setShip(null);
        setErrors((e) => ({ ...e, cep: "Não encontramos esse CEP. Confira os números." }));
      }
    } else {
      setQuotes(null);
      setShip(null);
    }
    setAddr(next);
  }

  function validate(): Errors {
    const e: Errors = {};
    if (name.trim().split(/\s+/).length < 2) e.name = "Informe nome e sobrenome.";
    if (!isEmail(email)) e.email = "Confira o e-mail.";
    if (!isPhone(phone)) e.phone = "Informe o telefone com DDD.";
    if (!isDoc(doc)) e.doc = "CPF ou CNPJ inválido. Confira os números.";
    if (onlyDigits(addr.cep).length !== 8 || !lookupCep(addr.cep)) e.cep = "Informe um CEP válido.";
    if (!addr.street.trim()) e.street = "Informe a rua.";
    if (!addr.number.trim()) e.number = "Informe o número.";
    if (!addr.district.trim()) e.district = "Informe o bairro.";
    if (!addr.city.trim()) e.city = "Informe a cidade.";
    if (!addr.uf) e.uf = "Escolha o estado.";
    if (!ship) e.ship = "Escolha uma opção de entrega.";
    if (method === "cartao") {
      if (!luhn(card.number)) e.cardNumber = "Número do cartão inválido.";
      if (card.holder.trim().split(/\s+/).length < 2) e.holder = "Nome como está no cartão.";
      if (!validExpiry(card.expiry)) e.expiry = "Validade inválida ou vencida.";
      if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = "CVV com 3 ou 4 números.";
    }
    return e;
  }

  function submit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector("[aria-invalid=true]") as HTMLElement | null;
      first?.focus();
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      const order = placeOrder({
        customer: { name: name.trim(), email: email.trim().toLowerCase(), phone, doc, company: company.trim() || undefined },
        address: addr,
        shipping: ship!,
        method,
        installments: method === "cartao" ? card.installments : undefined,
        cardLast4: method === "cartao" ? onlyDigits(card.number).slice(-4) : undefined,
      });
      router.push(`/pedido/${order.code}`);
    }, 900);
  }

  const set = (k: keyof Address) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setAddr({ ...addr, [k]: e.target.value });
  const brand = cardBrand(card.number);
  const payLabel = method === "pix" ? "Pagar com Pix" : method === "boleto" ? "Gerar boleto" : `Pagar ${brl(total)}`;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
      <h1 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold tracking-[-0.03em]">Finalizar compra</h1>
      <p className="mt-1 text-soft">Tudo numa página só. Revise os dados e escolha como pagar.</p>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
        <form
          className="space-y-6"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Section
            n={1}
            title="Seus dados"
            aside={
              !sess && (
                <Link href="/entrar?voltar=/checkout" className="text-[13px] font-medium text-lime-300 hover:text-lime-400">
                  Já tem conta? Entrar
                </Link>
              )
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome completo" error={errors.name}>
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!errors.name} />
              </Field>
              <Field label="E-mail" error={errors.email}>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!errors.email} />
              </Field>
              <Field label="Telefone com DDD" error={errors.phone}>
                <Input value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} inputMode="tel" autoComplete="tel" placeholder="(47) 99999-9999" aria-invalid={!!errors.phone} />
              </Field>
              <Field label="CPF ou CNPJ" error={errors.doc} hint="Usado na nota fiscal">
                <Input value={doc} onChange={(e) => setDoc(maskDoc(e.target.value))} inputMode="numeric" aria-invalid={!!errors.doc} />
              </Field>
              <Field label="Empresa ou marca (opcional)" className="md:col-span-2">
                <Input value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
              </Field>
            </div>
          </Section>

          <Section n={2} title="Entrega">
            <div className="grid gap-4 md:grid-cols-6">
              <Field label="CEP" error={errors.cep} className="md:col-span-2">
                <Input value={addr.cep} onChange={(e) => onCep(e.target.value)} inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" aria-invalid={!!errors.cep} />
              </Field>
              <Field label="Rua" error={errors.street} className="md:col-span-4">
                <Input value={addr.street} onChange={set("street")} autoComplete="address-line1" aria-invalid={!!errors.street} />
              </Field>
              <Field label="Número" error={errors.number} className="md:col-span-2">
                <Input value={addr.number} onChange={set("number")} aria-invalid={!!errors.number} />
              </Field>
              <Field label="Complemento" className="md:col-span-4">
                <Input value={addr.complement} onChange={set("complement")} placeholder="Sala, apto, bloco" />
              </Field>
              <Field label="Bairro" error={errors.district} className="md:col-span-2">
                <Input value={addr.district} onChange={set("district")} aria-invalid={!!errors.district} />
              </Field>
              <Field label="Cidade" error={errors.city} className="md:col-span-3">
                <Input value={addr.city} onChange={set("city")} autoComplete="address-level2" aria-invalid={!!errors.city} />
              </Field>
              <Field label="UF" error={errors.uf} className="md:col-span-1">
                <select value={addr.uf} onChange={set("uf")} aria-invalid={!!errors.uf} className="h-11 w-full rounded-xl border border-line-strong bg-night px-3 text-[14.5px] outline-none focus:border-lime-500 aria-[invalid=true]:border-danger/70">
                  <option value="">--</option>
                  {UFS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-6">
              <span className="mb-2.5 block text-[13px] font-medium text-soft">Opções de entrega</span>
              {quotes ? (
                <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Opções de entrega">
                  {quotes.map((q) => (
                    <button
                      type="button"
                      key={q.id}
                      role="radio"
                      aria-checked={ship?.id === q.id}
                      onClick={() => {
                        setShip(q);
                        setErrors((e) => ({ ...e, ship: undefined }));
                      }}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition ${ship?.id === q.id ? "border-lime-500 bg-lime-500/10" : "border-line-strong bg-night/60 hover:border-white/30"}`}
                    >
                      <span>
                        <span className="block text-[14px] font-semibold">{q.id === "retirada" ? q.service : `${q.carrier} ${q.service}`}</span>
                        <span className="block text-[12px] text-mute">{q.days}</span>
                      </span>
                      <span className={`font-bold tabular-nums ${q.price === 0 ? "text-lime-300" : ""}`}>{q.price === 0 ? "Grátis" : brl(q.price)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-line-strong p-4 text-[13.5px] text-mute">Digite o CEP para ver as opções de entrega, com valor e prazo.</p>
              )}
              {errors.ship && (
                <p className="mt-2 text-[12.5px] text-danger" role="alert">
                  {errors.ship}
                </p>
              )}
            </div>
          </Section>

          <Section n={3} title="Pagamento" aside={<span className="flex items-center gap-1.5 text-[12.5px] text-mute"><Lock className="size-3.5" aria-hidden /> Mercado Pago</span>}>
            <div className="grid grid-cols-3 gap-2.5" role="tablist" aria-label="Forma de pagamento">
              {(
                [
                  ["pix", QrCode, "Pix", "Aprovação na hora"],
                  ["cartao", CreditCard, "Cartão", `Até ${maxInst}x sem juros`],
                  ["boleto", Barcode, "Boleto", "Vence em 3 dias úteis"],
                ] as const
              ).map(([id, Icon, label, sub]) => (
                <button type="button" key={id} role="tab" aria-selected={method === id} onClick={() => setMethod(id)} className={`rounded-2xl border p-3.5 text-left transition ${method === id ? "border-lime-500 bg-lime-500/10" : "border-line-strong bg-night/60 hover:border-white/30"}`}>
                  <Icon className={`size-5 ${method === id ? "text-lime-300" : "text-soft"}`} aria-hidden />
                  <span className="mt-2 block text-[14.5px] font-semibold">{label}</span>
                  <span className="block text-[11.5px] text-mute">{sub}</span>
                </button>
              ))}
            </div>
            <div className="mt-5" role="tabpanel">
              {method === "pix" && <p className="rounded-2xl bg-night/70 p-4 text-[14px] leading-relaxed text-soft">Ao confirmar, mostramos o QR Code e o código Pix copia e cola. O código vale por 30 minutos e o pedido é aprovado assim que o pagamento cai.</p>}
              {method === "boleto" && <p className="rounded-2xl bg-night/70 p-4 text-[14px] leading-relaxed text-soft">O boleto é gerado na hora e vence em 3 dias úteis. A produção começa assim que o banco confirma o pagamento.</p>}
              {method === "cartao" && (
                <div className="grid gap-4 md:grid-cols-6">
                  <Field label="Número do cartão" error={errors.cardNumber} className="md:col-span-4">
                    <div className="relative">
                      <Input value={card.number} onChange={(e) => setCard({ ...card, number: maskCard(e.target.value) })} inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" aria-invalid={!!errors.cardNumber} />
                      {brand && <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-white/10 px-2 py-0.5 text-[11.5px] font-semibold">{brand}</span>}
                    </div>
                  </Field>
                  <Field label="Parcelas" className="md:col-span-2">
                    <select value={card.installments} onChange={(e) => setCard({ ...card, installments: Number(e.target.value) })} className="h-11 w-full rounded-xl border border-line-strong bg-night px-3 text-[14.5px] outline-none focus:border-lime-500">
                      {Array.from({ length: maxInst }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}x de {brl(total / n)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Nome impresso no cartão" error={errors.holder} className="md:col-span-6">
                    <Input value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value.toUpperCase() })} autoComplete="cc-name" aria-invalid={!!errors.holder} />
                  </Field>
                  <Field label="Validade" error={errors.expiry} className="md:col-span-3">
                    <Input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: maskExpiry(e.target.value) })} inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" aria-invalid={!!errors.expiry} />
                  </Field>
                  <Field label="CVV" error={errors.cvv} className="md:col-span-3">
                    <Input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: onlyDigits(e.target.value).slice(0, 4) })} inputMode="numeric" autoComplete="cc-csc" placeholder="123" aria-invalid={!!errors.cvv} />
                  </Field>
                </div>
              )}
            </div>
          </Section>

          <Button type="submit" size="lg" className="w-full lg:hidden" disabled={sending}>
            {sending ? <Spinner /> : null} {payLabel}
          </Button>
        </form>

        <aside className="space-y-4 rounded-3xl border border-line-strong bg-panel/80 p-6 backdrop-blur-md lg:sticky lg:top-24">
          <h2 className="text-[15px] font-semibold">Resumo do pedido</h2>
          <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {sum.priced.map((p) => (
              <li key={p.line.id} className="flex items-center gap-3">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-night">
                  <ProductMedia product={p.product} color={p.product.kind === "vestuario" ? parseSku(p.line.option)?.color : undefined} sizes="48px" />
                  <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-grape-600 px-1 text-[10.5px] font-bold">{p.line.qty}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium">{p.product.name}</span>
                  <span className="block truncate text-[12px] text-mute">{p.label}</span>
                </span>
                <span className="text-[13.5px] font-semibold tabular-nums">{brl(p.total)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between">
              <dt className="text-soft">Subtotal</dt>
              <dd className="tabular-nums">{brl(sum.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-soft">Frete{ship ? ` · ${ship.id === "retirada" ? "retirada" : ship.service}` : ""}</dt>
              <dd className="tabular-nums">{ship ? (ship.price ? brl(ship.price) : "Grátis") : "Informe o CEP"}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="text-2xl font-extrabold tabular-nums text-lime-300">{brl(total)}</dd>
            </div>
          </dl>
          <Button size="lg" className="hidden w-full lg:inline-flex" onClick={submit} disabled={sending}>
            {sending ? <Spinner /> : null} {payLabel}
          </Button>
          <p className="text-center text-[12px] text-mute">Ao confirmar você concorda com a política de reembolso da DTF4U.</p>
        </aside>
      </div>
    </div>
  );
}
