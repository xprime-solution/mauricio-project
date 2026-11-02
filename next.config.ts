import type { NextConfig } from "next";
import redirects from "./lib/data/redirects.json";

const nextConfig: NextConfig = {
  agentRules: false,
  async redirects() {
    // endereços do site antigo (um produto por metragem) levam ao produto novo com a opção já escolhida
    return redirects.map((r) => ({ source: r.from, destination: r.to, statusCode: 301 as const }));
  },
};

export default nextConfig;
