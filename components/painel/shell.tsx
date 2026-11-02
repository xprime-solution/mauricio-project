"use client";

import { ArrowRightLeft, Boxes, ExternalLink, LayoutDashboard, LogOut, Menu, Plug, ReceiptText, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ADMIN_LOGIN } from "@/lib/people";
import { adminLogin, adminLogout, checkExpired, useStore } from "@/lib/store";
import { Logo } from "../brand";
import { useHydrated } from "../motion";
import { Button, Field, Input, Spinner, UiProvider, useUi } from "../ui";

const NAV = [
  { href: "/painel", label: "Visão geral", icon: LayoutDashboard },
  { href: "/painel/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/painel/estoque", label: "Estoque", icon: Boxes },
  { href: "/painel/integracoes", label: "Integrações", icon: Plug },
  { href: "/painel/migracao", label: "Migração do site", icon: ArrowRightLeft },
];

function Gate() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="aurora relative isolate grid min-h-dvh place-items-center overflow-hidden bg-[linear-gradient(160deg,#1c0730,#141119_60%)] p-4">
      <div className="grid-lines absolute inset-0 -z-10" />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          window.setTimeout(() => {
            const r = adminLogin(email, pass);
            setBusy(false);
            setErr(r ?? "");
          }, 600);
        }}
        className="w-full max-w-md rounded-[2rem] border border-white/12 bg-panel/70 p-8 shadow-lift backdrop-blur-2xl animate-rise"
      >
        <Logo href={null} className="h-12 w-auto" />
        <h1 className="mt-6 text-2xl font-bold tracking-[-0.02em]">Painel da loja</h1>
        <p className="mt-1 text-[14px] text-soft">Pedidos, estoque e integrações da DTF4U num lugar só.</p>
        <div className="mt-7 space-y-4">
          <Field label="E-mail">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder={ADMIN_LOGIN.email} />
          </Field>
          <Field label="Senha">
            <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
          </Field>
          {err && (
            <p className="rounded-2xl border border-danger/40 bg-danger/10 p-3 text-[13.5px] text-danger" role="alert">
              {err}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy && <Spinner />} Entrar no painel
          </Button>
        </div>
        <Link href="/" className="mt-6 block text-center text-[13px] text-mute hover:text-lime-300">
          Voltar para a loja
        </Link>
      </form>
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const { toast } = useUi();
  const s = useStore();
  const pending = s.orders.filter((o) => o.status === "pago").length;

  useEffect(() => {
    checkExpired();
    const t = window.setInterval(checkExpired, 15000);
    return () => window.clearInterval(t);
  }, []);

  const nav = (
    <nav className="space-y-1" aria-label="Painel">
      {NAV.map((n) => {
        const active = n.href === "/painel" ? pathname === "/painel" : pathname?.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${active ? "bg-lime-500/12 text-lime-300 ring-1 ring-inset ring-lime-500/25" : "text-soft hover:bg-white/5 hover:text-text"}`}>
            <n.icon className="size-[18px]" aria-hidden />
            {n.label}
            {n.href === "/painel/pedidos" && pending > 0 && <span className="ml-auto rounded-full bg-lime-500 px-2 py-0.5 text-[11px] font-bold text-ink">{pending}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-night p-5 lg:flex">
        <Logo href="/painel" className="h-10 w-auto" />
        <p className="mb-6 mt-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-mute">Painel da loja</p>
        {nav}
        <div className="mt-auto space-y-1 border-t border-line pt-4">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-soft hover:bg-white/5 hover:text-text">
            <ExternalLink className="size-[18px]" aria-hidden /> Ver a loja
          </Link>
          <button
            onClick={() => {
              adminLogout();
              toast("Você saiu do painel");
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-soft hover:bg-white/5 hover:text-text"
          >
            <LogOut className="size-[18px]" aria-hidden /> Sair
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-ink/70 px-4 backdrop-blur-xl lg:hidden">
          <button onClick={() => setMenu(true)} className="grid size-10 place-items-center rounded-full hover:bg-white/8" aria-label="Abrir menu do painel">
            <Menu className="size-5" />
          </button>
          <Logo href="/painel" className="h-9 w-auto" />
        </header>
        <main className="page-enter mx-auto max-w-[1280px] p-4 md:p-8">{children}</main>
      </div>
      {menu && (
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu do painel">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-line-strong bg-panel/95 p-5 backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <Logo href="/painel" className="h-9 w-auto" />
              <button onClick={() => setMenu(false)} className="grid size-9 place-items-center rounded-full hover:bg-white/8" aria-label="Fechar menu">
                <X className="size-5" />
              </button>
            </div>
            {nav}
            <button onClick={() => adminLogout()} className="mt-6 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-soft hover:bg-white/5">
              <LogOut className="size-[18px]" aria-hidden /> Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Inner({ children }: { children: ReactNode }) {
  const s = useStore();
  const hydrated = useHydrated();
  if (!hydrated || !s.ready) return <div className="min-h-dvh bg-ink" />;
  if (!s.admin) return <Gate />;
  return <Frame>{children}</Frame>;
}

export function PainelShell({ children }: { children: ReactNode }) {
  return (
    <UiProvider>
      <Inner>{children}</Inner>
    </UiProvider>
  );
}

export function PageHead({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold tracking-[-0.02em]">{title}</h1>
        {text && <p className="mt-1 text-[14.5px] text-soft">{text}</p>}
      </div>
      {action}
    </div>
  );
}
