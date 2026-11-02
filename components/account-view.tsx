"use client";

import { LogOut, MapPin, Package, Repeat, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProduct, parseSku } from "@/lib/catalog";
import { brl, fmtDate } from "@/lib/format";
import { addToCart, logout, useStore } from "@/lib/store";
import { useHydrated } from "./motion";
import { STATUS } from "./order-view";
import { ProductMedia } from "./product-media";
import { Badge, Button, ButtonLink, useUi } from "./ui";

export function AccountView() {
  const s = useStore();
  const hydrated = useHydrated();
  const router = useRouter();
  const { toast, setCartOpen } = useUi();

  if (!hydrated || !s.ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-10 md:px-6">
        <div className="skeleton h-28 rounded-3xl" />
        <div className="skeleton mt-6 h-80 rounded-3xl" />
      </div>
    );
  }
  if (!s.session) {
    return (
      <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-white/5 ring-1 ring-line">
          <User className="size-7 text-mute" aria-hidden />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Entre para ver os seus pedidos</h1>
        <p className="mt-2 text-soft">Na sua conta você acompanha cada pedido e repete compras com um clique.</p>
        <ButtonLink href="/entrar" className="mt-6">
          Entrar ou criar conta
        </ButtonLink>
      </div>
    );
  }

  const me = s.session;
  const orders = s.orders.filter((o) => o.customer.email === me.email);
  const paid = orders.filter((o) => o.status !== "cancelado" && o.status !== "aguardando");
  const spent = paid.reduce((a, o) => a + o.total, 0);
  const pieces = paid.flatMap((o) => o.lines).filter((l) => getProduct(l.slug)?.kind === "vestuario").reduce((a, l) => a + l.qty, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 md:px-6">
      <div className="flex flex-wrap items-center gap-5 rounded-[2rem] border border-line bg-[linear-gradient(135deg,#2b0b49,#1b1722_65%)] p-6 md:p-8">
        {me.avatar ? (
          <Image src={me.avatar} alt={me.name} width={72} height={72} unoptimized className="size-18 rounded-full object-cover ring-2 ring-lime-500/60" />
        ) : (
          <span className="grid size-18 place-items-center rounded-full bg-white/8 ring-2 ring-lime-500/60">
            <User className="size-8 text-soft" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-mute">Olá,</p>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">{me.name}</h1>
          <p className="text-[14px] text-soft">
            {me.company ? `${me.company} · ` : ""}
            {me.email}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            toast("Você saiu da sua conta");
            router.push("/");
          }}
        >
          <LogOut className="size-4" aria-hidden /> Sair
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Pedidos", String(orders.length)],
          ["Total em compras", brl(spent)],
          ["Peças compradas", String(pieces)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-3xl border border-line bg-panel/60 p-5">
            <span className="block text-[13px] text-mute">{l}</span>
            <span className="mt-1 block text-2xl font-bold tabular-nums">{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        <section className="rounded-3xl border border-line bg-panel/60 p-5 md:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-[16px] font-semibold">
            <Package className="size-4.5 text-lime-400" aria-hidden /> Meus pedidos
          </h2>
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-strong p-8 text-center">
              <p className="font-semibold">Você ainda não fez pedidos</p>
              <ButtonLink href="/produto/dtf-textil-60cm" className="mt-4" size="sm">
                Fazer o primeiro pedido
              </ButtonLink>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => {
                const st = STATUS[o.status];
                const first = getProduct(o.lines[0].slug);
                return (
                  <li key={o.code} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-night/50 p-4 transition hover:border-white/20">
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-night">{first && <ProductMedia product={first} color={first.kind === "vestuario" ? parseSku(o.lines[0].option)?.color : undefined} sizes="56px" />}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-semibold">#{o.code}</span>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-mute">
                        {fmtDate(o.createdAt)} · {o.lines.length} {o.lines.length === 1 ? "item" : "itens"} · {o.lines.map((l) => l.name).filter((n, i, a) => a.indexOf(n) === i).join(", ")}
                      </p>
                    </div>
                    <span className="text-[15px] font-bold tabular-nums">{brl(o.total)}</span>
                    <div className="flex gap-2">
                      <ButtonLink href={`/pedido/${o.code}`} variant="outline" size="sm">
                        Ver pedido
                      </ButtonLink>
                      <Button
                        size="sm"
                        variant="grape"
                        onClick={() => {
                          addToCart(o.lines.map((l) => ({ slug: l.slug, option: l.option, qty: l.qty, arts: l.arts, note: l.note })));
                          toast(`Itens do pedido #${o.code} de volta no carrinho, com as mesmas artes`);
                          setCartOpen(true);
                        }}
                      >
                        <Repeat className="size-4" aria-hidden /> Repetir
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <aside className="rounded-3xl border border-line bg-panel/60 p-5 md:p-6">
          <h2 className="mb-3 flex items-center gap-2 text-[16px] font-semibold">
            <MapPin className="size-4.5 text-lime-400" aria-hidden /> Endereço de entrega
          </h2>
          {me.address.cep ? (
            <p className="text-[14px] leading-relaxed text-soft">
              {me.address.street}, {me.address.number}
              {me.address.complement ? `, ${me.address.complement}` : ""}
              <br />
              {me.address.district}
              <br />
              {me.address.city}/{me.address.uf} · {me.address.cep}
            </p>
          ) : (
            <p className="text-[14px] text-soft">O endereço fica salvo no seu primeiro pedido.</p>
          )}
          <p className="mt-4 border-t border-line pt-4 text-[13px] text-mute">
            {me.phone} · {me.doc}
          </p>
          <Link href="/checkout" className="mt-4 inline-block text-[13px] font-semibold text-lime-300 hover:text-lime-400">
            Ir para o checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
