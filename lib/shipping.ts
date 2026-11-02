import { onlyDigits } from "./format";
import type { ShippingQuote } from "./types";

const UF_RANGES: [number, number, string][] = [
  [1000, 19999, "SP"],
  [20000, 28999, "RJ"],
  [29000, 29999, "ES"],
  [30000, 39999, "MG"],
  [40000, 48999, "BA"],
  [49000, 49999, "SE"],
  [50000, 56999, "PE"],
  [57000, 57999, "AL"],
  [58000, 58999, "PB"],
  [59000, 59999, "RN"],
  [60000, 63999, "CE"],
  [64000, 64999, "PI"],
  [65000, 65999, "MA"],
  [66000, 68899, "PA"],
  [68900, 68999, "AP"],
  [69000, 69299, "AM"],
  [69300, 69399, "RR"],
  [69400, 69899, "AM"],
  [69900, 69999, "AC"],
  [70000, 72799, "DF"],
  [72800, 72999, "GO"],
  [73000, 73699, "DF"],
  [73700, 76799, "GO"],
  [76800, 76999, "RO"],
  [77000, 77999, "TO"],
  [78000, 78899, "MT"],
  [79000, 79999, "MS"],
  [80000, 87999, "PR"],
  [88000, 89999, "SC"],
  [90000, 99999, "RS"],
];

const CITIES: [number, number, string][] = [
  [88300, 88319, "Itajaí"],
  [88330, 88339, "Balneário Camboriú"],
  [88340, 88349, "Camboriú"],
  [88350, 88359, "Brusque"],
  [88370, 88379, "Navegantes"],
  [88000, 88099, "Florianópolis"],
  [88100, 88123, "São José"],
  [89000, 89099, "Blumenau"],
  [89200, 89239, "Joinville"],
  [89250, 89269, "Jaraguá do Sul"],
  [80000, 82999, "Curitiba"],
  [1000, 5999, "São Paulo"],
  [8000, 8499, "São Paulo"],
  [20000, 23799, "Rio de Janeiro"],
  [30000, 31999, "Belo Horizonte"],
  [90000, 91999, "Porto Alegre"],
];

export function lookupCep(cep: string): { uf: string; city: string } | null {
  const d = onlyDigits(cep);
  if (d.length !== 8) return null;
  const n = Number(d.slice(0, 5));
  const uf = UF_RANGES.find(([a, b]) => n >= a && n <= b)?.[2];
  if (!uf) return null;
  const city = CITIES.find(([a, b]) => n >= a && n <= b)?.[2] ?? "";
  return { uf, city };
}

const ZONE: Record<string, number> = {
  SC: 0,
  PR: 1,
  RS: 1,
  SP: 2,
  RJ: 2,
  MG: 2,
  ES: 2,
  MS: 3,
  DF: 3,
  GO: 3,
  MT: 3,
  BA: 3,
};

/** Cotação de frete a partir de Itajaí/SC, por CEP e peso. */
export function quoteShipping(cep: string, weightKg: number): ShippingQuote[] | null {
  const place = lookupCep(cep);
  if (!place) return null;
  const zone = ZONE[place.uf] ?? 4;
  const kg = Math.max(1, Math.ceil(weightKg * 1.15));
  const round = (v: number) => Math.floor(v) + 0.9;
  const pac = round(15.9 + zone * 6.5 + (kg - 1) * (2.4 + zone * 1.1));
  const sedex = round(24.9 + zone * 9.8 + (kg - 1) * (3.9 + zone * 1.7));
  const jadlog = round(17.9 + zone * 7.2 + (kg - 1) * (2.1 + zone * 0.9));
  const range = (a: number, b: number) => `${a} a ${b} dias úteis`;
  const quotes: ShippingQuote[] = [
    { id: "pac", carrier: "Correios", service: "PAC", price: pac, days: range(3 + zone, 6 + zone * 2) },
    { id: "jadlog", carrier: "Jadlog", service: ".Package", price: jadlog, days: range(2 + zone, 5 + zone * 2) },
    { id: "sedex", carrier: "Correios", service: "SEDEX", price: sedex, days: range(1 + Math.ceil(zone / 2), 2 + zone) },
  ];
  if (place.uf === "SC" && /Itajaí|Navegantes|Balneário Camboriú|Camboriú/.test(place.city)) {
    quotes.unshift({ id: "retirada", carrier: "DTF4U", service: "Retirar na loja em Itajaí", price: 0, days: "Aviso por e-mail quando estiver pronto" });
  }
  return quotes.sort((a, b) => a.price - b.price);
}
