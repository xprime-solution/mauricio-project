import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PainelShell } from "@/components/painel/shell";

export const metadata: Metadata = { title: { default: "Painel da loja", template: "%s · Painel DTF4U" }, robots: { index: false } };

export default function PainelLayout({ children }: { children: ReactNode }) {
  return <PainelShell>{children}</PainelShell>;
}
