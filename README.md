# DTF4U · loja e painel

Nova loja da DTF4U: impressão DTF Têxtil e DTF UV por metro, folhas A4 e A3, estampas prontas e camisetas lisas no mesmo pedido, com o painel da loja para pedidos, estoque, integrações e migração do site.

## Como rodar

```bash
npm install
npm run build
npm run start
```

A loja abre em http://localhost:3930. Para desenvolvimento: `npm run dev`.

## Acessos

| Perfil | Onde entra | E-mail | Senha |
|---|---|---|---|
| Cliente (Larissa Mendes · Estúdio Maré) | /entrar | larissa@estudiomare.com.br | Mare@2026 |
| Equipe DTF4U | /painel | admin@dtf4u.com.br | Painel@DTF4U |

Qualquer visitante também compra sem conta ou cria a própria conta em /entrar.

## Páginas

- `/` página inicial, `/categoria/[linha]`, `/produto/[produto]`, `/tabela-de-valores`
- `/carrinho`, `/checkout`, `/pedido/[número]` (Pix, cartão e boleto)
- `/entrar`, `/minha-conta`
- `/painel`, `/painel/pedidos`, `/painel/estoque`, `/painel/integracoes`, `/painel/migracao`

## Estrutura

- `lib/catalog.ts`: produtos, metragens, tamanhos, cores, SKUs e faixas de preço por quantidade.
- `lib/shipping.ts`: cotação de frete por CEP a partir de Itajaí/SC.
- `lib/store.ts`: carrinho, contas, pedidos, estoque e registro das integrações (Bling, Frenet, Mercado Pago, Meta e GA4).
- `lib/data/redirects.json` e `next.config.ts`: redirecionamentos 301 dos endereços antigos de metragem para os produtos novos.
