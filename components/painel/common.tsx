"use client";

import { User } from "lucide-react";
import Image from "next/image";
import { personByEmail } from "@/lib/people";
import type { Order } from "@/lib/types";
import type { ReactNode } from "react";

export function CustomerAvatar({ email, name, size = 36 }: { email: string; name: string; size?: number }) {
  const p = personByEmail(email);
  if (p?.avatar)
    return <Image src={p.avatar} alt={name} width={size} height={size} unoptimized className="shrink-0 rounded-full object-cover ring-1 ring-white/10" style={{ width: size, height: size }} />;
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-white/8 ring-1 ring-white/10" style={{ width: size, height: size }}>
      <User className="size-1/2 text-soft" aria-label={name} />
    </span>
  );
}

export const payLabel = (o: Order) => (o.payment.method === "pix" ? "Pix" : o.payment.method === "boleto" ? "Boleto" : `Cartão ${o.payment.installments ?? 1}x`);

export function Kpi({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-3xl border p-5 ${accent ? "border-lime-500/30 bg-[linear-gradient(135deg,rgba(140,211,18,0.12),#1b1722_70%)]" : "border-line bg-panel/70"}`}>
      <span className="block text-[13px] text-mute">{label}</span>
      <span className="mt-2 block text-[1.75rem] font-extrabold leading-none tracking-[-0.02em] tabular-nums">{value}</span>
      {sub && <span className="mt-2 block text-[12.5px] text-soft">{sub}</span>}
    </div>
  );
}
