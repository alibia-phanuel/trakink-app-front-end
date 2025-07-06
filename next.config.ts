import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // 🚨 Ajouté pour ignorer les erreurs ESLint au build
  },
};

export default nextConfig;
