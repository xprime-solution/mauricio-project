import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/catalog";
import { Logo, STORE } from "./brand";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-night">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-grape-500/60 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.3fr_1fr_1fr_1.2fr] md:px-6">
        <div>
          <Logo className="h-12 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-soft">Impressão DTF Têxtil, adesivos DTF UV e camisetas lisas para marcas, estamparias e empresas de todo o Brasil.</p>
          <p className="mt-4 text-xs text-mute">Pague com Pix, cartão em até 3x ou boleto pelo Mercado Pago.</p>
        </div>
        <nav aria-label="Produtos">
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-mute">Produtos</h3>
          <ul className="space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`} className="text-soft hover:text-lime-300">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Loja">
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-mute">Loja</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/tabela-de-valores" className="text-soft hover:text-lime-300">
                Tabela de valores
              </Link>
            </li>
            <li>
              <Link href="/#como-funciona" className="text-soft hover:text-lime-300">
                Como funciona o DTF
              </Link>
            </li>
            <li>
              <Link href="/minha-conta" className="text-soft hover:text-lime-300">
                Meus pedidos
              </Link>
            </li>
            <li>
              <Link href="/carrinho" className="text-soft hover:text-lime-300">
                Carrinho
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-mute">Fale com a gente</h3>
          <ul className="space-y-2.5 text-sm text-soft">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-lime-400" aria-hidden />
              {STORE.address}
            </li>
            <li className="flex gap-2.5">
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-lime-400" aria-hidden />
              <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-lime-300">
                {STORE.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-lime-400" aria-hidden />
              {STORE.phone2}
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-lime-400" aria-hidden />
              <a href={`mailto:${STORE.email}`} className="hover:text-lime-300">
                {STORE.email}
              </a>
            </li>
            <li className="pl-6 text-xs text-mute">{STORE.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-mute md:px-6">
          <span>
            © DTF4U {new Date().getFullYear()} · CNPJ {STORE.cnpj} · Itajaí, Santa Catarina
          </span>
          <span>Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
