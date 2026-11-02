import Image from "next/image";
import { COLORS } from "@/lib/catalog";
import type { ColorId, Product } from "@/lib/types";
import { DesignArt } from "./estampas";
import { Garment } from "./garment";

/** Imagem principal de um produto: foto, peça na cor escolhida ou arte da estampa. */
export function ProductMedia({ product, color, sizes = "(max-width: 768px) 50vw, 25vw", priority, className = "" }: { product: Product; color?: ColorId; sizes?: string; priority?: boolean; className?: string }) {
  if (product.kind === "estampa") {
    return (
      <div className={`relative grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_40%,#2b0b49,#141119_70%)] ${className}`}>
        <DesignArt id={product.design} className="h-[78%] w-[78%] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-[1.06]" />
      </div>
    );
  }
  if (product.kind === "vestuario" && color) {
    return (
      <div className={`relative grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_38%,#4a3f5a,#1b1722_74%)] ${className}`}>
        <Garment shape={product.shape} color={COLORS[color].hex} className="h-[84%] w-[84%] transition-transform duration-700 group-hover:scale-[1.04]" />
      </div>
    );
  }
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <Image src={product.images[0]} alt={product.name} fill sizes={sizes} priority={priority} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
    </div>
  );
}
