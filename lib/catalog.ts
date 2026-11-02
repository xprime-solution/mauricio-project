import type { CategorySlug, Color, ColorId, GarmentProduct, PriceTier, Product, Size } from "./types";

export const COLORS: Record<ColorId, Color> = {
  amarelo: { id: "amarelo", name: "Amarelo", hex: "#f2c318", code: "AMA" },
  "azul-marinho": { id: "azul-marinho", name: "Azul marinho", hex: "#1f2a44", code: "AZM" },
  branco: { id: "branco", name: "Branco", hex: "#f7f7f5", code: "BRA" },
  "cinza-mescla": { id: "cinza-mescla", name: "Cinza mescla", hex: "#a5a7aa", code: "CIN" },
  laranja: { id: "laranja", name: "Laranja", hex: "#f26b1d", code: "LAR" },
  preto: { id: "preto", name: "Preto", hex: "#141414", code: "PRT" },
  verde: { id: "verde", name: "Verde", hex: "#13803a", code: "VRD" },
  vermelho: { id: "vermelho", name: "Vermelho", hex: "#d4191f", code: "VRM" },
};

export const SIZE_ORDER: Size[] = ["P", "M", "G", "GG", "G1", "G2", "G3"];

export const CATEGORIES: { slug: CategorySlug; name: string; title: string; text: string; image: string }[] = [
  {
    slug: "impressao-dtf",
    name: "Impressão DTF",
    title: "Impressão DTF Têxtil",
    text: "Suas artes impressas em filme, prontas para aplicar com prensa em algodão, poliéster e couro.",
    image: "/images/impressora-dtf-filme.jpg",
  },
  {
    slug: "dtf-uv",
    name: "DTF UV",
    title: "Adesivos DTF UV",
    text: "Adesivos de alto brilho para superfícies rígidas como vidro, plástico, metal e madeira.",
    image: "/images/adesivo-uv-torradeira.jpg",
  },
  {
    slug: "camisetas-lisas",
    name: "Camisetas Lisas",
    title: "Camisetas lisas para estampar",
    text: "Algodão fio 30.1 penteado em 8 cores e 7 tamanhos, com preço menor a partir de 12 peças.",
    image: "/images/camisetas-lisas-cores-flatlay.jpg",
  },
  {
    slug: "uniformes",
    name: "Uniformes",
    title: "Uniformes e peças premium",
    text: "Polo, dry fit e moletom canguru para equipes, empresas e marcas próprias.",
    image: "/images/uniformes-time-futebol.jpg",
  },
  {
    slug: "estampas",
    name: "Estampas Prontas",
    title: "Estampas prontas para aplicar",
    text: "Artes exclusivas já impressas em DTF, em A4 ou A3, para quem quer começar sem criar arquivo.",
    image: "/images/cura-estampa-camiseta-preta.jpg",
  },
];

const tiers = (a: number, b: number, c: number): PriceTier[] => [
  { min: 1, max: 11, price: a },
  { min: 12, max: 49, price: b },
  { min: 50, max: null, price: c },
];

const textil60 = [79.9, 159.8, 239.7, 319.6, 399.5, 479.4, 559.3, 639.2, 719.1, 799.0];
const textil = [59.9, 96.0, 144.0, 192.0, 240.0, 288.0, 336.0, 384.0, 432.0, 480.0];
const uv = [179.9, 359.9, 479.9, 639.9, 799.9, 959.9, 1019.9, 1279.9, 1439.9, 1599.9];

export const PRODUCTS: Product[] = [
  {
    slug: "dtf-textil-60cm",
    name: "DTF Têxtil 60 cm",
    short: "Impressão por metro em filme de 60 cm de largura",
    description: [
      "Monte o seu filme com quantas artes couberem em 60 cm de largura e escolha de 1 a 10 metros.",
      "Ideal para transferir designs vibrantes e duráveis em tecidos como algodão, poliéster e couro, com acabamento profissional.",
    ],
    category: "impressao-dtf",
    kind: "metro",
    prices: textil60,
    needsArt: true,
    width: "60 cm",
    images: ["/images/impressora-dtf-filme.jpg", "/images/prensa-termica-camiseta-amarela.jpg", "/images/cura-estampa-camiseta-preta.jpg"],
    badge: "Mais pedido",
    weight: 0.09,
    bestseller: true,
  },
  {
    slug: "dtf-textil",
    name: "DTF Têxtil",
    short: "Impressão por metro com preço progressivo",
    description: [
      "Impressão DTF por metro com o preço do metro caindo conforme a metragem: 1 metro sai a R$ 59,90 e, de 2 metros em diante, cada metro sai a R$ 48,00.",
      "Aplicação simples, sem preparo complexo, ideal para produção em pequena e média escala.",
    ],
    category: "impressao-dtf",
    kind: "metro",
    prices: textil,
    needsArt: true,
    images: ["/images/prensa-termica-camiseta-amarela.jpg", "/images/impressora-dtf-filme.jpg", "/images/cura-estampa-camiseta-preta.jpg"],
    weight: 0.09,
  },
  {
    slug: "folha-dtf-textil",
    name: "Folha DTF Têxtil",
    short: "Folhas avulsas em A4 ou A3 para pedidos pequenos",
    description: [
      "Para quem precisa de poucas peças: envie a arte e receba a folha pronta para aplicar.",
      "A mesma impressão DTF Têxtil, no tamanho A4 ou A3.",
    ],
    category: "impressao-dtf",
    kind: "folha",
    sizes: [
      { id: "A4", label: "A4 · 21 × 29,7 cm", price: 18.9 },
      { id: "A3", label: "A3 · 29,7 × 42 cm", price: 28.9 },
    ],
    needsArt: true,
    images: ["/images/cura-estampa-camiseta-preta.jpg", "/images/prensa-termica-camiseta-amarela.jpg"],
    weight: 0.03,
  },
  {
    slug: "dtf-uv",
    name: "DTF UV",
    short: "Adesivos por metro para superfícies rígidas",
    description: [
      "Adesivos de alto brilho, resistentes a arranhões, para plástico, vidro, metal e madeira.",
      "Perfeitos para brindes, garrafas, copos, cadernos e personalizados em geral.",
    ],
    category: "dtf-uv",
    kind: "metro",
    prices: uv,
    needsArt: true,
    images: ["/images/adesivo-uv-torradeira.jpg", "/images/adesivos-coloridos.jpg"],
    badge: "Alto brilho",
    weight: 0.09,
    bestseller: true,
  },
  {
    slug: "folha-dtf-uv",
    name: "Folha DTF UV",
    short: "Adesivos UV em A4 ou A3",
    description: [
      "A impressão DTF UV em folha avulsa, para testar uma ideia ou atender um pedido pequeno.",
      "Aplique em superfícies rígidas sem prensa: é só destacar e colar.",
    ],
    category: "dtf-uv",
    kind: "folha",
    sizes: [
      { id: "A4", label: "A4 · 21 × 29,7 cm", price: 39.9 },
      { id: "A3", label: "A3 · 29,7 × 42 cm", price: 59.9 },
    ],
    needsArt: true,
    images: ["/images/adesivos-coloridos.jpg", "/images/adesivo-uv-torradeira.jpg"],
    weight: 0.03,
  },
  {
    slug: "camiseta-lisa-premium",
    name: "Camiseta Lisa Premium",
    short: "100% algodão fio 30.1 penteado",
    description: [
      "Conforto e estilo em uma peça versátil, ideal para o dia a dia ou para personalização.",
      "Confeccionada com tecido de alta qualidade, garante durabilidade e caimento perfeito para receber a sua estampa DTF.",
    ],
    category: "camisetas-lisas",
    kind: "vestuario",
    shape: "camiseta",
    skuPrefix: "CAM",
    colors: ["amarelo", "azul-marinho", "branco", "cinza-mescla", "laranja", "preto", "verde", "vermelho"],
    sizes: ["P", "M", "G", "GG", "G1", "G2", "G3"],
    tiers: tiers(24.9, 21.9, 18.9),
    features: [
      { title: "Gola premium", text: "100% algodão fio 30.1 penteado" },
      { title: "Costura reforçada", text: "Costura dupla e reforço de ombro a ombro" },
      { title: "Pronta para DTF", text: "Superfície lisa que recebe a estampa por inteiro" },
    ],
    images: ["/images/modelo-camiseta-preta-homem.jpg", "/images/modelo-camiseta-preta-mulher.jpg", "/images/camisetas-lisas-cores-flatlay.jpg", "/images/camiseta-preta-dobrada.jpg"],
    badge: "Novidade",
    weight: 0.18,
    bestseller: true,
  },
  {
    slug: "camiseta-dry-fit",
    name: "Camiseta Dry Fit",
    short: "Poliéster leve para esporte e uniforme",
    description: [
      "Tecido leve que seca rápido, pensado para equipes, academias e eventos esportivos.",
      "Recebe estampa DTF com cores vivas e boa elasticidade.",
    ],
    category: "camisetas-lisas",
    kind: "vestuario",
    shape: "camiseta",
    skuPrefix: "DRY",
    colors: ["branco", "preto", "azul-marinho", "cinza-mescla"],
    sizes: ["P", "M", "G", "GG", "G1"],
    tiers: tiers(22.9, 19.9, 16.9),
    features: [
      { title: "Seca rápido", text: "Poliéster leve e respirável" },
      { title: "Para equipes", text: "Grade de tamanhos de P a G1" },
      { title: "Cores vivas", text: "Ótima para estampas coloridas" },
    ],
    images: ["/images/modelo-dry-fit-preta.jpg", "/images/uniformes-time-futebol.jpg", "/images/camisetas-cinza-branca-preta.jpg"],
    weight: 0.15,
  },
  {
    slug: "camisa-polo",
    name: "Camisa Polo",
    short: "Polo lisa para uniforme de empresa",
    description: [
      "A polo que deixa a equipe com cara de empresa, pronta para receber o logo em DTF no peito ou nas costas.",
      "Gola e punho firmes que mantêm o formato depois de muitas lavagens.",
    ],
    category: "uniformes",
    kind: "vestuario",
    shape: "polo",
    skuPrefix: "POL",
    colors: ["azul-marinho", "branco", "cinza-mescla", "preto"],
    sizes: ["P", "M", "G", "GG"],
    tiers: tiers(44.9, 39.9, 35.9),
    features: [
      { title: "Gola firme", text: "Gola e punho em ribana" },
      { title: "Uniforme de empresa", text: "Logo no peito ou nas costas" },
      { title: "Tecido piquet", text: "Toque macio e boa ventilação" },
    ],
    images: ["/images/polo-azul-uniforme.jpg", "/images/polo-laranja.jpg"],
    weight: 0.25,
    bestseller: true,
  },
  {
    slug: "moletom-canguru-premium",
    name: "Moletom Canguru Premium",
    short: "Moletom com capuz e bolso canguru",
    description: [
      "Moletom felpado com capuz e bolso canguru, ideal para coleções de inverno e uniformes de equipe.",
      "Área ampla na frente e nas costas para estampas grandes em DTF.",
    ],
    category: "uniformes",
    kind: "vestuario",
    shape: "moletom",
    skuPrefix: "MOL",
    colors: ["azul-marinho", "branco", "cinza-mescla", "preto", "verde", "vermelho"],
    sizes: ["P", "M", "G", "GG", "G1", "G2", "G3"],
    tiers: tiers(99.9, 89.9, 79.9),
    features: [
      { title: "Felpado por dentro", text: "Quentinho para o inverno do Sul" },
      { title: "Bolso canguru", text: "Capuz com cordão" },
      { title: "Estampa grande", text: "Frente e costas com área ampla" },
    ],
    images: ["/images/moletom-canguru-cinza.jpg", "/images/moletom-canguru-azul.jpg"],
    weight: 0.6,
  },
  ...(
    [
      ["onda-itajai", "Onda Itajaí", "Sol, mar e a onda que todo litoral catarinense conhece."],
      ["tigre-neon", "Tigre Neon", "Traço forte e cores elétricas para coleções de streetwear."],
      ["cafe-forte", "Café Forte", "Para cafeterias, eventos e quem vive de café."],
      ["game-over", "Game Over", "Pixel art retrô para o público gamer."],
      ["astronauta", "Astronauta Surf", "Um astronauta pegando onda entre as estrelas."],
      ["cacto-pop", "Cacto Pop", "Cores alegres para coleções de verão e infantis."],
    ] as const
  ).map(
    ([design, name, text]): Product => ({
      slug: `estampa-${design}`,
      name: `Estampa ${name}`,
      short: "Estampa pronta para aplicar com prensa",
      description: [text, "Já impressa em DTF Têxtil. Escolha o tamanho, aplique com prensa e a peça está pronta."],
      category: "estampas",
      kind: "estampa",
      design,
      sizes: [
        { id: "A4", label: "A4 · 21 × 29,7 cm", price: 5 },
        { id: "A3", label: "A3 · 29,7 × 42 cm", price: 10 },
      ],
      images: [],
      weight: 0.02,
      bestseller: design === "tigre-neon" || design === "onda-itajai",
    }),
  ),
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function productsIn(category: CategorySlug): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function skuFor(p: GarmentProduct, color: ColorId, size: Size): string {
  return `${p.skuPrefix}-${COLORS[color].code}-${size}`;
}

export function parseSku(sku: string): { prefix: string; color: ColorId; size: Size } | null {
  const [prefix, code, size] = sku.split("-");
  const color = (Object.values(COLORS).find((c) => c.code === code) || null)?.id;
  if (!prefix || !color || !size) return null;
  return { prefix, color, size: size as Size };
}

export function garmentBySku(sku: string): GarmentProduct | undefined {
  const parsed = parseSku(sku);
  if (!parsed) return undefined;
  return PRODUCTS.find((p): p is GarmentProduct => p.kind === "vestuario" && p.skuPrefix === parsed.prefix);
}

export function tierPrice(p: GarmentProduct, qty: number): number {
  const t = p.tiers.find((x) => qty >= x.min && (x.max === null || qty <= x.max)) || p.tiers[0];
  return t.price;
}

/** Menor preço exibido no card ("a partir de"). */
export function fromPrice(p: Product): number {
  switch (p.kind) {
    case "metro":
      return p.prices[0];
    case "folha":
    case "estampa":
      return Math.min(...p.sizes.map((s) => s.price));
    case "vestuario":
      return p.tiers[p.tiers.length - 1].price;
  }
}

export function allGarmentSkus(): { product: GarmentProduct; sku: string; color: ColorId; size: Size }[] {
  const out: { product: GarmentProduct; sku: string; color: ColorId; size: Size }[] = [];
  for (const p of PRODUCTS) {
    if (p.kind !== "vestuario") continue;
    for (const c of p.colors) for (const s of p.sizes) out.push({ product: p, sku: skuFor(p, c, s), color: c, size: s });
  }
  return out;
}

export function optionLabel(p: Product, option: string): string {
  switch (p.kind) {
    case "metro":
      return `${option} ${option === "1" ? "metro" : "metros"}`;
    case "folha":
    case "estampa":
      return p.sizes.find((s) => s.id === option)?.label.split(" · ")[0] ?? option;
    case "vestuario": {
      const parsed = parseSku(option);
      return parsed ? `${COLORS[parsed.color].name} · ${parsed.size}` : option;
    }
  }
}
