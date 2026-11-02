"use client";

import { Check, Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";

/* ---------- botões ---------- */

type Variant = "primary" | "ghost" | "outline" | "danger" | "grape";

const variants: Record<Variant, string> = {
  primary:
    "bg-lime-500 text-ink hover:bg-lime-400 hover:shadow-glow active:bg-lime-600 disabled:bg-lime-500/40 disabled:text-ink/60",
  grape: "bg-grape-600 text-white hover:bg-grape-500 active:bg-grape-700 disabled:opacity-50",
  outline: "border border-line-strong text-text hover:border-lime-500/70 hover:text-lime-300 disabled:opacity-50",
  ghost: "text-soft hover:text-text hover:bg-white/5 disabled:opacity-50",
  danger: "border border-danger/40 text-danger hover:bg-danger/10 disabled:opacity-50",
};

export function btn(variant: Variant = "primary", size: "sm" | "md" | "lg" = "md") {
  const sizes = { sm: "h-9 px-3.5 text-[13px]", md: "h-11 px-5 text-sm", lg: "h-13 px-7 text-[15px]" };
  return `inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.005em] transition-[background,box-shadow,color,border-color,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${sizes[size]} ${variants[variant]}`;
}

export function Button({ variant = "primary", size = "md", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  return <button {...props} className={`${btn(variant, size)} ${className}`} />;
}

export function ButtonLink({ variant = "primary", size = "md", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  return <Link {...props} className={`${btn(variant, size)} ${className}`} />;
}

/* ---------- formulários ---------- */

export function Field({ label, error, hint, children, className = "" }: { label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-soft">{label}</span>
        {children}
      </label>
      {error ? (
        <span className="mt-1.5 flex items-center gap-1 text-[12.5px] text-danger" role="alert">
          <X className="size-3.5" aria-hidden /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-[12.5px] text-mute">{hint}</span>
      ) : null}
    </div>
  );
}

export const inputCls =
  "h-11 w-full rounded-xl border border-line-strong bg-night px-3.5 text-[14.5px] text-text placeholder:text-mute/70 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/25 aria-[invalid=true]:border-danger/70";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function QtyStepper({ value, onChange, min = 1, max = 999, label = "Quantidade", size = "md" }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label?: string; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-9" : "h-11";
  return (
    <div className={`inline-flex ${h} items-center rounded-full border border-line-strong bg-night`} role="group" aria-label={label}>
      <button type="button" className="grid h-full w-10 place-items-center rounded-l-full text-soft hover:text-lime-300 disabled:opacity-30" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Diminuir">
        <Minus className="size-4" />
      </button>
      <input
        className="h-full w-12 bg-transparent text-center text-[15px] font-semibold tabular-nums outline-none"
        inputMode="numeric"
        aria-label={label}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/\D/g, ""));
          if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n || min)));
        }}
      />
      <button type="button" className="grid h-full w-10 place-items-center rounded-r-full text-soft hover:text-lime-300 disabled:opacity-30" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Aumentar">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function Badge({ children, tone = "lime", className = "" }: { children: ReactNode; tone?: "lime" | "grape" | "mute" | "warn" | "danger" | "info"; className?: string }) {
  const tones = {
    lime: "bg-lime-500/15 text-lime-300 ring-lime-500/30",
    grape: "bg-grape-500/20 text-grape-300 ring-grape-500/35",
    mute: "bg-white/6 text-soft ring-white/12",
    warn: "bg-warn/15 text-warn ring-warn/30",
    danger: "bg-danger/15 text-danger ring-danger/30",
    info: "bg-info/15 text-info ring-info/30",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ring-1 ring-inset ${tones[tone]} ${className}`}>{children}</span>;
}

/* ---------- modal ---------- */

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm animate-fade" onClick={onClose} />
      <div ref={ref} tabIndex={-1} className={`relative max-h-[88vh] w-full overflow-auto rounded-3xl border border-line-strong bg-panel/95 p-6 shadow-lift outline-none backdrop-blur-xl animate-pop ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-mute hover:bg-white/8 hover:text-text" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- interface: carrinho lateral e avisos ---------- */

interface Toast {
  id: number;
  text: string;
  tone: "ok" | "erro";
}

const UiCtx = createContext<{ cartOpen: boolean; setCartOpen: (v: boolean) => void; toast: (text: string, tone?: Toast["tone"]) => void } | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);
  return (
    <UiCtx.Provider value={{ cartOpen, setCartOpen, toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[90] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lift backdrop-blur-xl animate-rise ${t.tone === "ok" ? "border-lime-500/30 bg-panel/90" : "border-danger/40 bg-panel/90"}`}>
            <span className={`grid size-6 shrink-0 place-items-center rounded-full ${t.tone === "ok" ? "bg-lime-500 text-ink" : "bg-danger text-white"}`}>
              {t.tone === "ok" ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            </span>
            {t.text}
          </div>
        ))}
      </div>
    </UiCtx.Provider>
  );
}

export function useUi() {
  const ctx = useContext(UiCtx);
  if (!ctx) throw new Error("UiProvider ausente");
  return ctx;
}

/* ---------- utilidades visuais ---------- */

export function SectionTitle({ eyebrow, title, text, action, center }: { eyebrow?: string; title: ReactNode; text?: string; action?: ReactNode; center?: boolean }) {
  return (
    <div className={`mb-8 flex flex-wrap items-end justify-between gap-4 ${center ? "flex-col items-center text-center" : ""}`}>
      <div className={center ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-lime-400">{eyebrow}</p>}
        <h2 className="text-[clamp(1.6rem,2.6vw,2.35rem)] font-bold leading-[1.1] tracking-[-0.02em]">{title}</h2>
        {text && <p className="mt-3 text-[15px] leading-relaxed text-soft">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className = "size-4" }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} aria-hidden />;
}
