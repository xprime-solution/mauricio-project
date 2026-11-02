"use client";

import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Logo, STORE } from "./brand";
import { useHydrated } from "./motion";
import { ProductMedia } from "./product-media";
import { useUi } from "./ui";

const NAV = [...CATEGORIES.map((c) => ({ href: `/categoria/${c.slug}`, label: c.slug === "estampas" ? "Estampas" : c.name })), { href: "/tabela-de-valores", label: "Tabela de valores" }];

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function SearchBox({ onDone }: { onDone?: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const wrap = useRef<HTMLDivElement>(null);
  const results = useMemo(() => {
    const t = norm(q.trim());
    if (t.length < 2) return [];
    return PRODUCTS.filter((p) => norm(`${p.name} ${p.short} ${p.category}`).includes(t)).slice(0, 6);
  }, [q]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div ref={wrap} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[0]) {
            router.push(`/produto/${results[0].slug}`);
            setOpen(false);
            setQ("");
            onDone?.();
          }
        }}
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute" aria-hidden />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar DTF, camiseta, moletom..."
          aria-label="Buscar produtos"
          className="h-10 w-full rounded-full border border-line-strong bg-white/5 pl-10 pr-4 text-sm outline-none transition placeholder:text-mute focus:border-lime-500 focus:bg-night"
        />
      </form>
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-line-strong bg-panel/95 p-1.5 shadow-lift backdrop-blur-xl animate-pop">
          {results.length ? (
            results.map((p) => (
              <Link
                key={p.slug}
                href={`/produto/${p.slug}`}
                onClick={() => {
                  setOpen(false);
                  setQ("");
                  onDone?.();
                }}
                className="group flex items-center gap-3 rounded-xl p-2 hover:bg-white/6"
              >
                <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-night">
                  <ProductMedia product={p} sizes="44px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-mute">{p.short}</span>
                </span>
              </Link>
            ))
          ) : (
            <p className="p-3 text-sm text-mute">Nenhum produto encontrado para “{q}”.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const s = useStore();
  const hydrated = useHydrated();
  const { setCartOpen } = useUi();
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const count = s.cart.reduce((a, l) => a + l.qty, 0);

  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  return (
    <>
      <div className="hidden border-b border-line bg-grape-950 text-[12.5px] text-soft md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-6">
          <span>Envio para todo o Brasil a partir de Itajaí/SC · {STORE.hours}</span>
          <span className="flex items-center gap-4">
            <span>Pix, cartão em até 3x ou boleto</span>
            <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer" className="font-medium text-lime-300 hover:text-lime-400">
              WhatsApp {STORE.phone}
            </a>
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-line bg-ink/65 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-5 px-4 md:px-6">
          <button className="grid size-10 place-items-center rounded-full text-soft hover:bg-white/8 lg:hidden" onClick={() => setMenu(true)} aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <Logo className="h-10 w-auto md:h-11" />
          <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Categorias">
            {NAV.map((n) => {
              const active = pathname?.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className={`relative whitespace-nowrap rounded-full px-2.5 py-2 text-[13.5px] font-medium transition ${active ? "text-lime-300" : "text-soft hover:text-text"}`}>
                  {n.label}
                  {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-lime-500" />}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto hidden w-full max-w-[280px] md:block lg:max-w-[210px] xl:max-w-[260px]">
            <SearchBox />
          </div>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link
              href={hydrated && s.session ? "/minha-conta" : "/entrar"}
              className="grid size-10 place-items-center overflow-hidden rounded-full text-soft ring-1 ring-line-strong transition hover:text-lime-300 hover:ring-lime-500/60"
              aria-label={hydrated && s.session ? `Minha conta de ${s.session.name}` : "Entrar"}
            >
              {hydrated && s.session?.avatar ? <Image src={s.session.avatar} alt={s.session.name} width={40} height={40} unoptimized className="size-10 object-cover" /> : <User className="size-[18px]" />}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative grid size-10 place-items-center rounded-full text-soft ring-1 ring-line-strong transition hover:text-lime-300 hover:ring-lime-500/60"
              aria-label={`Abrir carrinho${hydrated && count ? `, ${count} itens` : ""}`}
            >
              <ShoppingBag className="size-[18px]" />
              {hydrated && count > 0 && (
                <span key={count} className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-lime-500 px-1 text-[11px] font-bold text-ink animate-pop">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-fade" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(86vw,360px)] flex-col gap-5 border-r border-line-strong bg-panel/95 p-5 backdrop-blur-xl" style={{ animation: "slide-in .35s cubic-bezier(.2,.8,.2,1) reverse backwards" }}>
            <div className="flex items-center justify-between">
              <Logo className="h-10 w-auto" />
              <button onClick={() => setMenu(false)} className="grid size-10 place-items-center rounded-full hover:bg-white/8" aria-label="Fechar menu">
                <X className="size-5" />
              </button>
            </div>
            <SearchBox onDone={() => setMenu(false)} />
            <nav className="flex flex-col" aria-label="Categorias">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className="border-b border-line py-3.5 text-[15px] font-medium text-soft hover:text-lime-300">
                  {n.label}
                </Link>
              ))}
              <Link href={hydrated && s.session ? "/minha-conta" : "/entrar"} onClick={() => setMenu(false)} className="py-3.5 text-[15px] font-medium text-soft hover:text-lime-300">
                {hydrated && s.session ? "Minha conta" : "Entrar ou criar conta"}
              </Link>
            </nav>
            <p className="mt-auto text-xs text-mute">
              {STORE.hours}
              <br />
              WhatsApp {STORE.phone}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
