import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   typescript: {
    // !! ADVERTÊNCIA !!
    // Permite que seu projeto seja compilado para produção mesmo que
    // tenha erros de tipo. Use com extremo cuidado.
    ignoreBuildErrors: true,

  },
};

export default nextConfig;
