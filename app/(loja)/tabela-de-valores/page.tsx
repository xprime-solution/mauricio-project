import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PRODUCTS } from "@/lib/catalog";
import { brl } from "@/lib/format";
import type { DesignProduct, GarmentProduct, MetroProduct, SheetProduct } from "@/lib/types";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = { title: "Tabela de valores", description: "Preços da impressão DTF Têxtil, DTF UV, folhas A4 e A3, estampas prontas e camisetas lisas." };

function Card({ title, caption, children }: { title: string; caption: string; children: ReactNode }) {
  return (
    <Reveal className="overflow-hidden rounded-3xl border border-line bg-panel shadow-card">
      <div className="border-b border-line bg-[linear-gradient(120deg,#2b0b49,#1b1722)] px-6 py-4">
        <h2 className="text-[17px] font-bold">{title}</h2>
        <p className="text-[13px] text-soft">{caption}</p>
      </div>
      {children}
    </Reveal>
  );
}

export default function PricesPage() {
  const metros = PRODUCTS.filter((p): p is MetroProduct => p.kind === "metro");
  const sheets = PRODUCTS.filter((p): p is SheetProduct => p.kind === "folha");
  const garments = PRODUCTS.filter((p): p is GarmentProduct => p.kind === "vestuario");
  const design = PRODUCTS.find((p): p is DesignProduct => p.kind === "estampa")!;
  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 md:px-6">
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-lime-400">Tabela de valores</p>
      <h1 className="max-w-3xl text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">Todos os preços numa página, sem precisar pedir orçamento</h1>
      <p className="mt-4 max-w-2xl text-[15.5px] text-soft">Os valores abaixo são os mesmos do carrinho. O frete é calculado pelo CEP no produto ou no checkout.</p>

      <div className="mt-10 space-y-8">
        <Card title="Impressão por metro" caption="Escolha a metragem na página do produto e envie a arte no próprio pedido">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[14px]">
              <thead>
                <tr className="bg-white/[0.04] text-left text-[11.5px] uppercase tracking-[0.12em] text-mute">
                  <th className="px-6 py-3">Metragem</th>
                  {metros.map((m) => (
                    <th key={m.slug} className="px-6 py-3 text-right">
                      <Link href={`/produto/${m.slug}`} className="hover:text-lime-300">
                        {m.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }, (_, i) => (
                  <tr key={i} className="border-t border-line even:bg-white/[0.02]">
                    <td className="px-6 py-2.5 font-semibold">
                      {i + 1} {i ? "metros" : "metro"}
                    </td>
                    {metros.map((m) => (
                      <td key={m.slug} className="px-6 py-2.5 text-right tabular-nums text-soft">
                        {brl(m.prices[i])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-8 md:grid-cols-2">
          <Card title="Folhas avulsas" caption="Para pedidos pequenos, com envio da arte">
            <table className="w-full text-[14px]">
              <tbody>
                {sheets.flatMap((s) =>
                  s.sizes.map((z) => (
                    <tr key={s.slug + z.id} className="border-t border-line first:border-t-0 even:bg-white/[0.02]">
                      <td className="px-6 py-3">
                        <Link href={`/produto/${s.slug}?tamanho=${z.id}`} className="font-semibold hover:text-lime-300">
                          {s.name}
                        </Link>
                        <span className="block text-[12.5px] text-mute">{z.label}</span>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold tabular-nums text-lime-300">{brl(z.price)}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </Card>
          <Card title="Estampas prontas" caption="Já impressas em DTF Têxtil, é só aplicar">
            <table className="w-full text-[14px]">
              <tbody>
                {design.sizes.map((z) => (
                  <tr key={z.id} className="border-t border-line first:border-t-0">
                    <td className="px-6 py-3">
                      <span className="font-semibold">Tamanho {z.id}</span>
                      <span className="block text-[12.5px] text-mute">{z.label.split(" · ")[1]}</span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold tabular-nums text-lime-300">{brl(z.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-line px-6 py-3 text-[13px]">
              <Link href="/categoria/estampas" className="font-semibold text-lime-300 hover:text-lime-400">
                Ver as estampas disponíveis
              </Link>
            </p>
          </Card>
        </div>

        <Card title="Camisetas lisas e uniformes" caption="O preço de cada peça cai conforme a quantidade do mesmo modelo no carrinho">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-[14px]">
              <thead>
                <tr className="bg-white/[0.04] text-left text-[11.5px] uppercase tracking-[0.12em] text-mute">
                  <th className="px-6 py-3">Peça</th>
                  <th className="px-6 py-3 text-right">1 a 11</th>
                  <th className="px-6 py-3 text-right">12 a 49</th>
                  <th className="px-6 py-3 text-right text-lime-300">50 ou mais</th>
                </tr>
              </thead>
              <tbody>
                {garments.map((g) => (
                  <tr key={g.slug} className="border-t border-line even:bg-white/[0.02]">
                    <td className="px-6 py-3">
                      <Link href={`/produto/${g.slug}`} className="font-semibold hover:text-lime-300">
                        {g.name}
                      </Link>
                      <span className="block text-[12.5px] text-mute">
                        {g.colors.length} cores · {g.sizes[0]} ao {g.sizes[g.sizes.length - 1]}
                      </span>
                    </td>
                    {g.tiers.map((t, i) => (
                      <td key={t.min} className={`px-6 py-3 text-right tabular-nums ${i === 2 ? "font-semibold text-lime-300" : "text-soft"}`}>
                        {brl(t.price)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
