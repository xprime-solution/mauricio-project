import Link from "next/link";
import { Logo } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="aurora relative isolate grid min-h-dvh place-items-center overflow-hidden bg-[linear-gradient(160deg,#1c0730,#0e0c12_65%)] p-6 text-center">
      <div>
        <Logo className="mx-auto h-12 w-auto" />
        <p className="mt-10 text-[5rem] font-extrabold leading-none tracking-[-0.04em] text-lime-300">404</p>
        <h1 className="mt-3 text-2xl font-bold">Essa página não existe</h1>
        <p className="mt-2 text-soft">O endereço pode ter mudado. Comece pela página inicial ou pela tabela de valores.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-11 items-center rounded-full bg-lime-500 px-5 text-sm font-semibold text-ink hover:bg-lime-400">
            Ir para a página inicial
          </Link>
          <Link href="/tabela-de-valores" className="inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-sm font-semibold hover:border-lime-500">
            Ver tabela de valores
          </Link>
        </div>
      </div>
    </div>
  );
}
