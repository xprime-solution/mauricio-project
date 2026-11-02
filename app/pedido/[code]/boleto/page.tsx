import type { Metadata } from "next";
import { BoletoView } from "@/components/boleto-view";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  return { title: `Boleto do pedido #${code}` };
}

export default async function BoletoPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <BoletoView code={code} />;
}
