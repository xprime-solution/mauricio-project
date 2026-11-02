import type { Metadata } from "next";
import { Migration } from "@/components/painel/migration";

export const metadata: Metadata = { title: "Migração do site" };

export default function Page() {
  return <Migration />;
}
