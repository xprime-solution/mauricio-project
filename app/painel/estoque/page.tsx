import type { Metadata } from "next";
import { Stock } from "@/components/painel/stock";

export const metadata: Metadata = { title: "Estoque" };

export default function Page() {
  return <Stock />;
}
