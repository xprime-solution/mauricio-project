"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { brl, fmtDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { STORE } from "./brand";
import { useHydrated } from "./motion";

/** Barras no padrão intercalado 2 de 5 a partir dos números da linha digitável. */
function Bars({ digits }: { digits: string }) {
  const P = ["00110", "10001", "01001", "11000", "00101", "10100", "01100", "00011", "10010", "01010"];
  const d = digits.length % 2 ? `0${digits}` : digits;
  const bars: { w: number; black: boolean }[] = [
    { w: 1, black: true },
    { w: 1, black: false },
    { w: 1, black: true },
    { w: 1, black: false },
  ];
  for (let i = 0; i < d.length; i += 2) {
    const a = P[Number(d[i])];
    const b = P[Number(d[i + 1])];
    for (let k = 0; k < 5; k++) {
      bars.push({ w: a[k] === "1" ? 3 : 1, black: true });
      bars.push({ w: b[k] === "1" ? 3 : 1, black: false });
    }
  }
  bars.push({ w: 3, black: true }, { w: 1, black: false }, { w: 1, black: true });
  let x = 0;
  const rects = bars.map((b, i) => {
    const r = b.black ? <rect key={i} x={x} y={0} width={b.w} height={50} /> : null;
    x += b.w;
    return r;
  });
  return (
    <svg viewBox={`0 0 ${x} 50`} preserveAspectRatio="none" className="h-14 w-full" fill="#000" aria-label="Código de barras do boleto">
      {rects}
    </svg>
  );
}

export function BoletoView({ code }: { code: string }) {
  const s = useStore();
  const hydrated = useHydrated();
  const o = s.orders.find((x) => x.code === code);
  if (!hydrated || !s.ready) return <div className="min-h-dvh bg-ink" />;
  if (!o || !o.payment.boletoLine) {
    return (
      <div className="grid min-h-dvh place-items-center bg-ink p-6 text-center text-text">
        <div>
          <p className="text-lg font-semibold">Boleto não encontrado para este pedido.</p>
          <Link href={`/pedido/${code}`} className="mt-4 inline-block text-lime-300 underline">
            Voltar ao pedido
          </Link>
        </div>
      </div>
    );
  }
  const line = o.payment.boletoLine;
  const cell = "border border-neutral-400 px-2 py-1.5 align-top";
  const lab = "block text-[9px] uppercase tracking-wide text-neutral-600";
  return (
    <div className="min-h-dvh bg-neutral-200 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between px-4 print:hidden">
        <Link href={`/pedido/${o.code}`} className="inline-flex items-center gap-2 text-sm font-medium text-neutral-800 hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Voltar ao pedido
        </Link>
        <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-900 px-5 text-sm font-semibold text-white hover:bg-neutral-700">
          <Printer className="size-4" aria-hidden /> Imprimir boleto
        </button>
      </div>
      <div className="mx-auto max-w-3xl bg-white p-8 text-neutral-900 shadow-xl print:shadow-none">
        <div className="flex items-end justify-between border-b-2 border-neutral-900 pb-2">
          <span className="text-xl font-bold">Mercado Pago</span>
          <span className="border-x-2 border-neutral-900 px-3 text-xl font-bold">323-0</span>
          <span className="font-mono text-[13px] font-semibold tracking-wide">{line}</span>
        </div>
        <table className="mt-2 w-full border-collapse text-[12px]">
          <tbody>
            <tr>
              <td className={cell} colSpan={3}>
                <span className={lab}>Local de pagamento</span>Pagável em qualquer banco, lotérica ou app de banco até o vencimento
              </td>
              <td className={`${cell} w-40 bg-neutral-100`}>
                <span className={lab}>Vencimento</span>
                <b>{o.payment.boletoDue ? fmtDate(o.payment.boletoDue) : ""}</b>
              </td>
            </tr>
            <tr>
              <td className={cell} colSpan={3}>
                <span className={lab}>Beneficiário</span>DTF4U · CNPJ {STORE.cnpj}
              </td>
              <td className={cell}>
                <span className={lab}>Nosso número</span>
                {o.code}
              </td>
            </tr>
            <tr>
              <td className={cell}>
                <span className={lab}>Data do documento</span>
                {fmtDate(o.createdAt)}
              </td>
              <td className={cell}>
                <span className={lab}>Nº do documento</span>PED-{o.code}
              </td>
              <td className={cell}>
                <span className={lab}>Espécie</span>R$
              </td>
              <td className={`${cell} bg-neutral-100`}>
                <span className={lab}>Valor do documento</span>
                <b>{brl(o.total)}</b>
              </td>
            </tr>
            <tr>
              <td className={cell} colSpan={4}>
                <span className={lab}>Instruções</span>Pedido #{o.code} na loja DTF4U. Não receber após o vencimento. Depois do pagamento, a produção começa assim que o banco confirmar.
              </td>
            </tr>
            <tr>
              <td className={cell} colSpan={4}>
                <span className={lab}>Pagador</span>
                {o.customer.name}
                {o.customer.company ? ` · ${o.customer.company}` : ""} · {o.customer.doc}
                <br />
                {o.address.street}, {o.address.number} · {o.address.district} · {o.address.city}/{o.address.uf} · {o.address.cep}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-5">
          <Bars digits={line.replace(/\D/g, "").slice(0, 44)} />
        </div>
      </div>
    </div>
  );
}
