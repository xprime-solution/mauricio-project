import { ArrowRight, CreditCard, FileUp, PackageCheck, Ruler, Shirt, Sparkles, Truck, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { COLORS, CATEGORIES, PRODUCTS, getProduct } from "@/lib/catalog";
import { brl } from "@/lib/format";
import type { MetroProduct } from "@/lib/types";
import { DesignArt } from "@/components/estampas";
import { Garment } from "@/components/garment";
import { Faq, ProductRail, ShirtShowcase } from "@/components/home-parts";
import { Counter, Reveal } from "@/components/motion";
import { ButtonLink, SectionTitle } from "@/components/ui";

const FAQ = [
  {
    q: "O que é a impressão DTF?",
    a: "DTF é a impressão da sua arte em um filme especial. Depois é só aplicar na peça com prensa térmica. Funciona em algodão, poliéster, misturas e até couro, com cores vivas e boa elasticidade.",
  },
  {
    q: "Como preparo o arquivo da arte?",
    a: "Envie em PNG com fundo transparente ou em PDF, no tamanho real de impressão e com boa resolução. No DTF Têxtil 60 cm você pode montar várias artes lado a lado na largura do filme e enviar até 10 arquivos por produto.",
  },
  {
    q: "Qual a diferença entre DTF Têxtil e DTF UV?",
    a: "O DTF Têxtil é para tecidos e é aplicado com prensa. O DTF UV vira um adesivo de alto brilho para superfícies rígidas como vidro, plástico, metal e madeira, e é aplicado sem prensa.",
  },
  {
    q: "Posso comprar a camiseta lisa junto com a impressão?",
    a: "Pode. As camisetas lisas entram no mesmo carrinho que a sua impressão DTF, com um frete só. A partir de 12 peças do mesmo modelo o preço de cada uma cai, e a partir de 50 cai de novo.",
  },
  {
    q: "Quanto custa o frete e quando chega?",
    a: "Digite o seu CEP na página do produto ou no carrinho. Aparecem as opções de entrega com o valor e o prazo de cada uma. Em Itajaí, Navegantes e Balneário Camboriú você também pode retirar na loja sem custo.",
  },
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "Pix, cartão de crédito em até 3 vezes e boleto, tudo pelo Mercado Pago. No Pix o pedido é confirmado na hora em que o pagamento cai.",
  },
];

export default function HomePage() {
  const dtf60 = getProduct("dtf-textil-60cm") as MetroProduct;
  const bestsellers = PRODUCTS.filter((p) => p.bestseller);
  return (
    <>
      {/* HERO */}
      <section className="aurora relative isolate overflow-hidden bg-[linear-gradient(160deg,#1c0730_0%,#2b0b49_42%,#5a149a_100%)]">
        <div className="grid-lines absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 md:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-20">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-[12.5px] font-medium text-lime-300 backdrop-blur-md animate-rise">
              <Sparkles className="size-3.5" aria-hidden /> Agora com camisetas lisas no catálogo
            </p>
            <h1 className="text-[clamp(2.4rem,5.4vw,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] animate-rise [animation-delay:80ms]">
              Sua arte impressa e a camiseta para aplicar, <span className="bg-gradient-to-r from-lime-300 to-lime-500 bg-clip-text text-transparent">no mesmo pedido.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-soft animate-rise [animation-delay:160ms]">
              Impressão DTF Têxtil por metro, adesivos DTF UV e camisetas lisas em 8 cores. Você envia a arte na página do produto, calcula o frete pelo CEP e paga no Pix, cartão ou boleto.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-rise [animation-delay:240ms]">
              <ButtonLink href="/produto/dtf-textil-60cm" size="lg">
                Comprar DTF por metro <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
              <ButtonLink href="/categoria/camisetas-lisas" variant="outline" size="lg" className="border-white/25 backdrop-blur-md">
                Ver camisetas lisas
              </ButtonLink>
            </div>
            <ul className="mt-10 grid max-w-xl grid-cols-1 gap-3 text-[13.5px] text-soft sm:grid-cols-3 animate-rise [animation-delay:320ms]">
              {[
                [Upload, "Arte enviada no próprio pedido"],
                [Truck, "Frete calculado pelo CEP"],
                [CreditCard, "Pix, cartão ou boleto"],
              ].map(([Icon, t], i) => {
                const I = Icon as typeof Upload;
                return (
                  <li key={i} className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lime-500/15 text-lime-300 ring-1 ring-lime-500/30">
                      <I className="size-4" aria-hidden />
                    </span>
                    {t as string}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[560px] animate-rise [animation-delay:200ms]">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] border border-white/12 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
              <Image src="/images/impressora-dtf-filme.jpg" alt="Impressora DTF imprimindo artes coloridas em filme" fill priority sizes="(max-width: 1024px) 92vw, 560px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-grape-950/80 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-8 -left-4 w-[46%] rounded-3xl border border-white/15 bg-ink/45 p-3 shadow-lift backdrop-blur-xl sm:-left-10">
              <Garment shape="camiseta" color={COLORS.preto.hex} className="w-full">
                <DesignArt id="tigre-neon" embed={{ x: 140, y: 112, size: 120 }} />
              </Garment>
              <p className="mt-1 text-center text-[12px] font-medium text-soft">Camiseta lisa + estampa DTF</p>
            </div>
            <Link
              href="/produto/dtf-textil-60cm"
              className="absolute -right-2 top-6 rounded-2xl border border-white/15 bg-ink/45 px-4 py-3 shadow-lift backdrop-blur-xl transition hover:border-lime-500/60 sm:-right-6"
            >
              <span className="block text-[11.5px] uppercase tracking-[0.14em] text-mute">DTF Têxtil 60 cm</span>
              <span className="mt-0.5 block text-[22px] font-bold text-lime-300">{brl(dtf60.prices[0])}</span>
              <span className="block text-[12px] text-soft">por metro de filme</span>
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden border-y border-line bg-lime-500 py-3 text-ink" aria-hidden>
        <div className="marquee flex w-max gap-10 whitespace-nowrap text-[15px] font-extrabold uppercase tracking-[0.18em]">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["DTF Têxtil", "DTF UV", "Camisetas lisas", "Uniformes", "Estampas prontas", "Rápido e prático"].map((t) => (
              <span key={`${k}-${t}`} className="flex items-center gap-10">
                {t} <span className="text-grape-700">✦</span>
              </span>
            )),
          )}
        </div>
      </div>

      {/* CATEGORIAS */}
      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-6">
        <Reveal>
          <SectionTitle eyebrow="O que você encontra aqui" title="Tudo para estampar, de uma peça a mil" text="Escolha por onde começar. Cada linha tem a sua página, com preço, envio da arte e frete na mesma tela." />
        </Reveal>
        <div className="grid auto-rows-[220px] gap-4 md:grid-cols-4 md:auto-rows-[240px]">
          {CATEGORIES.map((c, i) => {
            const span = i === 0 ? "md:col-span-2 md:row-span-2" : i === 2 ? "md:col-span-2" : "";
            return (
              <Reveal key={c.slug} delay={i * 70} className={span}>
                <Link href={`/categoria/${c.slug}`} className="group relative block h-full overflow-hidden rounded-3xl border border-line shadow-card">
                  <Image src={c.image} alt={c.title} fill sizes={i === 0 ? "(max-width: 768px) 92vw, 50vw" : "(max-width: 768px) 92vw, 25vw"} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                    <h3 className={`font-bold tracking-[-0.02em] ${i === 0 ? "text-[1.7rem]" : "text-xl"}`}>{c.name}</h3>
                    <p className={`mt-1.5 max-w-md text-[13.5px] leading-relaxed text-soft ${i === 0 ? "" : "line-clamp-2"}`}>{c.text}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-lime-300">
                      Ver produtos <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* CAMISETAS LISAS */}
      <section className="relative mt-24 overflow-hidden border-y border-line bg-night py-20">
        <div className="pointer-events-none absolute -right-40 top-10 size-[520px] rounded-full bg-grape-600/15 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal>
            <ShirtShowcase />
          </Reveal>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-24 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line shadow-card">
            <Image src="/images/prensa-termica-camiseta-amarela.jpg" alt="Camiseta amarela na prensa térmica para aplicar a estampa DTF" fill sizes="(max-width: 1024px) 92vw, 45vw" className="object-cover" />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-ink/45 p-4 backdrop-blur-xl">
              <p className="text-[13px] text-soft">Aplicação com prensa térmica, sem preparo complexo do tecido.</p>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <SectionTitle eyebrow="Como funciona" title="Do arquivo à peça pronta em 4 passos" />
            </Reveal>
            <ol className="relative space-y-6">
              <svg className="absolute left-[19px] top-6 h-[calc(100%-48px)] w-1" preserveAspectRatio="none" viewBox="0 0 2 100" aria-hidden>
                <line x1="1" y1="0" x2="1" y2="100" stroke="#8cd312" strokeOpacity="0.5" strokeWidth="2" className="draw" style={{ "--len": 100 } as CSSProperties} />
              </svg>
              {[
                [Ruler, "Escolha a metragem ou o tamanho", "De 1 a 10 metros de filme, ou folhas A4 e A3 para pedidos pequenos. O preço aparece na hora."],
                [FileUp, "Envie a arte no próprio pedido", "Arraste o PNG ou PDF para a página do produto. Até 10 arquivos, sem precisar mandar por e-mail."],
                [Shirt, "Adicione as camisetas lisas", "Monte a grade de tamanhos na cor que quiser. A partir de 12 peças o preço de cada uma cai."],
                [PackageCheck, "Pague e acompanhe", "Pix, cartão ou boleto. Você acompanha cada etapa do pedido na sua conta até a entrega."],
              ].map(([Icon, t, d], i) => {
                const I = Icon as typeof Ruler;
                return (
                  <Reveal as="li" key={i} delay={i * 90} className="relative flex gap-5">
                    <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-lime-500 text-ink shadow-glow">
                      <I className="size-[18px]" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-[16.5px] font-semibold">
                        <span className="mr-2 text-lime-400">0{i + 1}</span>
                        {t as string}
                      </h3>
                      <p className="mt-1 text-[14.5px] leading-relaxed text-soft">{d as string}</p>
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section className="mx-auto mt-24 max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-line bg-[linear-gradient(135deg,#2b0b49,#141119_60%)] md:grid-cols-4">
          {[
            [60, " cm", "de largura útil no filme DTF Têxtil"],
            [10, "", "artes por produto, enviadas no pedido"],
            [8, "", "cores de camiseta lisa premium"],
            [7, "", "tamanhos, do P ao G3"],
          ].map(([n, suf, label], i) => (
            <div key={i} className={`p-6 md:p-8 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""}`}>
              <span className="block text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold leading-none tracking-[-0.03em] text-lime-300">
                <Counter to={n as number} suffix={suf as string} />
              </span>
              <span className="mt-2 block text-[13.5px] text-soft">{label as string}</span>
            </div>
          ))}
        </div>
      </section>

      {/* MAIS PEDIDOS */}
      <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <Reveal>
          <SectionTitle
            eyebrow="Mais pedidos"
            title="O que mais sai da nossa produção"
            action={
              <Link href="/tabela-de-valores" className="inline-flex items-center gap-1.5 text-sm font-semibold text-lime-300 hover:text-lime-400">
                Ver tabela de valores <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          />
        </Reveal>
        <ProductRail products={bestsellers} />
      </section>

      {/* PARA MARCAS */}
      <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <div className="grid overflow-hidden rounded-[2rem] border border-line bg-panel shadow-card lg:grid-cols-2">
          <div className="relative min-h-[300px]">
            <Image src="/images/embalagem-pedido.jpg" alt="Empreendedor embalando pedidos de camisetas" fill sizes="(max-width: 1024px) 92vw, 50vw" className="object-cover" />
          </div>
          <div className="p-8 md:p-12">
            <Reveal>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-lime-400">Para marcas e estamparias</p>
              <h2 className="text-[clamp(1.6rem,2.6vw,2.2rem)] font-bold leading-[1.1] tracking-[-0.02em]">Compre em grade, repita o pedido e acompanhe tudo na sua conta</h2>
              <ul className="mt-6 space-y-4 text-[14.5px] text-soft">
                {[
                  ["Grade por tamanho", "Informe quantas peças de cada tamanho quer na mesma cor, de uma vez."],
                  ["Preço por quantidade", "Somando 12 peças do mesmo modelo o preço cai, e com 50 cai de novo."],
                  ["Pedido repetido", "Na sua conta você repete um pedido anterior com um clique."],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-lime-500" />
                    <span>
                      <b className="font-semibold text-text">{t}.</b> {d}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/entrar">Criar minha conta</ButtonLink>
                <ButtonLink href="/produto/camiseta-lisa-premium" variant="outline">
                  Montar uma grade
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 pt-24 md:px-6">
        <Reveal>
          <SectionTitle center eyebrow="Dúvidas frequentes" title="Antes de fazer o seu pedido" />
        </Reveal>
        <Reveal>
          <Faq items={FAQ} />
        </Reveal>
      </section>
    </>
  );
}
