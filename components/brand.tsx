import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "h-11 w-auto", href = "/" }: { className?: string; href?: string | null }) {
  const img = <Image src="/brand/dtf4u-logo.png" alt="DTF4U · Rápido e prático" width={250} height={94} priority className={className} />;
  if (href === null) return img;
  return (
    <Link href={href} aria-label="DTF4U, página inicial" className="shrink-0">
      {img}
    </Link>
  );
}

export const STORE = {
  phone: "(47) 98824-4407",
  phone2: "(47) 8916-9009",
  whatsapp: "5547988244407",
  email: "atendimento@dtf4u.com.br",
  quoteEmail: "orcamento@dtf4u.com.br",
  address: "Rua João Gaya, 397, sala 02 · Vila Operária · Itajaí/SC",
  hours: "Segunda a sexta, das 9h às 18h",
  cnpj: "40.028.451/0001-51",
};
