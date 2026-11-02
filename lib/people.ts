import type { Address } from "./types";

export interface Person {
  name: string;
  company: string;
  email: string;
  phone: string;
  avatar: string;
  address: Address;
}

const addr = (cep: string, street: string, number: string, district: string, city: string, uf: string, complement = ""): Address => ({
  cep,
  street,
  number,
  complement,
  district,
  city,
  uf,
});

export const CUSTOMER_LOGIN = { email: "larissa@estudiomare.com.br", password: "Mare@2026" };
export const ADMIN_LOGIN = { email: "admin@dtf4u.com.br", password: "Painel@DTF4U" };

export const PEOPLE: Person[] = [
  {
    name: "Larissa Mendes",
    company: "Estúdio Maré",
    email: CUSTOMER_LOGIN.email,
    phone: "(47) 99812-3407",
    avatar: "/avatars/directora-compras.jpg",
    address: addr("88330-075", "Rua 2500", "418", "Centro", "Balneário Camboriú", "SC", "Sala 3"),
  },
  {
    name: "Rafael Teixeira",
    company: "Teixeira Uniformes",
    email: "rafael@teixeirauniformes.com.br",
    phone: "(47) 99144-2210",
    avatar: "/avatars/distribuidor-regional.jpg",
    address: addr("89010-001", "Rua XV de Novembro", "1290", "Centro", "Blumenau", "SC"),
  },
  {
    name: "Camila Rocha",
    company: "Rocha Personalizados",
    email: "camila@rochapersonalizados.com.br",
    phone: "(41) 99630-1187",
    avatar: "/avatars/retrato-mulher-profissional-32.jpg",
    address: addr("80250-104", "Avenida Sete de Setembro", "3165", "Rebouças", "Curitiba", "PR"),
  },
  {
    name: "Diego Martins",
    company: "Sul Surf Co.",
    email: "diego@sulsurf.com.br",
    phone: "(48) 99702-5541",
    avatar: "/avatars/man-driver-beard-casual.jpg",
    address: addr("88062-300", "Rua Laurindo Januário da Silveira", "2210", "Lagoa da Conceição", "Florianópolis", "SC"),
  },
  {
    name: "Patrícia Lopes",
    company: "Ateliê Lopes",
    email: "patricia@atelielopes.com.br",
    phone: "(47) 99251-8803",
    avatar: "/avatars/retrato-mulher-madura-50.jpg",
    address: addr("89201-100", "Rua do Príncipe", "640", "Centro", "Joinville", "SC"),
  },
  {
    name: "Bruno Carvalho",
    company: "Arena Fut Sete",
    email: "bruno@arenafutsete.com.br",
    phone: "(51) 99418-7720",
    avatar: "/avatars/man-young-casual-portrait.jpg",
    address: addr("90035-190", "Rua Ramiro Barcelos", "1450", "Bom Fim", "Porto Alegre", "RS"),
  },
  {
    name: "Juliana Prado",
    company: "JP Brindes",
    email: "juliana@jpbrindes.com.br",
    phone: "(11) 98877-3104",
    avatar: "/avatars/retrato-mulher-jovem-casual-28.jpg",
    address: addr("04538-132", "Avenida Brigadeiro Faria Lima", "3900", "Itaim Bibi", "São Paulo", "SP", "Conj. 52"),
  },
  {
    name: "Marcos Almeida",
    company: "Almeida Eventos",
    email: "marcos@almeidaeventos.com.br",
    phone: "(47) 99133-6651",
    avatar: "/avatars/retrato-homem-maduro-45.jpg",
    address: addr("88301-410", "Rua Hercílio Luz", "255", "Centro", "Itajaí", "SC"),
  },
  {
    name: "Aline Souza",
    company: "Café Grão de Areia",
    email: "aline@graodeareia.com.br",
    phone: "(47) 99620-4478",
    avatar: "/avatars/admin-laura.jpg",
    address: addr("88370-120", "Avenida João Sacavém", "980", "Centro", "Navegantes", "SC"),
  },
  {
    name: "Thiago Ramos",
    company: "Ramos Estamparia",
    email: "thiago@ramosestamparia.com.br",
    phone: "(47) 99355-1902",
    avatar: "/avatars/retrato-homem-jovem-27.jpg",
    address: addr("88350-301", "Avenida Primeiro de Maio", "1120", "Primeiro de Maio", "Brusque", "SC"),
  },
  {
    name: "Fernanda Costa",
    company: "Costa Moda Praia",
    email: "fernanda@costamodapraia.com.br",
    phone: "(21) 99744-2318",
    avatar: "/avatars/retrato-mulher-adulta-41.jpg",
    address: addr("22041-001", "Avenida Nossa Senhora de Copacabana", "1032", "Copacabana", "Rio de Janeiro", "RJ", "Loja B"),
  },
  {
    name: "Gustavo Nunes",
    company: "Nunes Academia",
    email: "gustavo@nunesacademia.com.br",
    phone: "(31) 99280-6619",
    avatar: "/avatars/man-young-mustache-portrait.jpg",
    address: addr("30140-071", "Avenida do Contorno", "6594", "Savassi", "Belo Horizonte", "MG"),
  },
  {
    name: "Renato Lima",
    company: "Lima Gráfica",
    email: "renato@limagrafica.com.br",
    phone: "(47) 99507-3366",
    avatar: "/avatars/propietario-clinica.jpg",
    address: addr("89251-300", "Rua Reinoldo Rau", "512", "Centro", "Jaraguá do Sul", "SC"),
  },
  {
    name: "Eduardo Pires",
    company: "Pires Sports",
    email: "eduardo@piressports.com.br",
    phone: "(48) 99836-1205",
    avatar: "/avatars/admin-especialista-zoho.jpg",
    address: addr("88103-400", "Avenida Presidente Kennedy", "698", "Campinas", "São José", "SC"),
  },
];

export const personByEmail = (email: string) => PEOPLE.find((p) => p.email === email.trim().toLowerCase());

/** Gera um CNPJ válido a partir de uma base de 8 dígitos (filial 0001). */
export function cnpjFrom(base8: string) {
  const d = (base8 + "0001").split("").map(Number);
  const dv = (nums: number[], weights: number[]) => {
    const r = nums.reduce((a, n, i) => a + n * weights[i], 0) % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = dv(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = dv([...d, d1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const s = [...d, d1, d2].join("");
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12)}`;
}
