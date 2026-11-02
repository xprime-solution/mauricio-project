import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppButton } from "@/components/whatsapp";
import { UiProvider } from "@/components/ui";
import type { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <UiProvider>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-lime-500 focus:px-4 focus:py-2 focus:text-ink">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="page-enter">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </UiProvider>
  );
}
