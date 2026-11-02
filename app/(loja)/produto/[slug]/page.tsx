import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/lib/catalog";
import { ProductView } from "@/components/product-view";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return { title: p.name, description: `${p.short}. ${p.description[0]}`, openGraph: p.images[0] ? { images: [{ url: p.images[0] }] } : undefined };
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  if (!getProduct(slug)) notFound();
  const metros = Number(sp.metros);
  const tamanho = typeof sp.tamanho === "string" ? sp.tamanho : undefined;
  return <ProductView slug={slug} metros={Number.isFinite(metros) && metros > 0 ? metros : undefined} tamanho={tamanho} />;
}
