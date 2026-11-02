import type { Metadata } from "next";
import { Integrations } from "@/components/painel/integrations";

export const metadata: Metadata = { title: "Integrações" };

export default function Page() {
  return <Integrations />;
}
