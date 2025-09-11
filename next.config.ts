//import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
   typescript: {
    // !! ADVERTÊNCIA !!
    // Permite que seu projeto seja compilado para produção mesmo que
    // tenha erros de tipo. Use com extremo cuidado.
    ignoreBuildErrors: true,
      output: 'standalone',

  },
};

export default nextConfig;
