import type { Metadata } from "next";
import { OrderView } from "@/components/order-view";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  return { title: `Pedido #${code}` };
}

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <OrderView code={code} />;
}
