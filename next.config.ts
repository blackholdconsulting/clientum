// next.config.ts
import path from "path";
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    // conserva cualquier alias existente
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Aquí le decimos a Webpack:
      //   importar "cldr/..." debe buscar en cldrjs/dist/cldr/...
      cldr: path.resolve(__dirname, "node_modules", "cldrjs", "dist", "cldr"),
      // por si algún require hace exactamente "cldr" sin path
      "cldr$": path.resolve(__dirname, "node_modules", "cldrjs", "dist", "cldr", "cldr.js"),
    };
    return config;
  },
};

export default nextConfig;
