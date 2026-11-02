import type { Metadata } from "next";
import { Suspense } from "react";
import { Orders } from "@/components/painel/orders";

export const metadata: Metadata = { title: "Pedidos" };

export default function Page() {
  return (
    <Suspense>
      <Orders />
    </Suspense>
  );
}
