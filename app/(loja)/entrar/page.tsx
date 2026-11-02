import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthView } from "@/components/auth-view";

export const metadata: Metadata = { title: "Entrar ou criar conta" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthView />
    </Suspense>
  );
}
