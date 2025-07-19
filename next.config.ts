// next.config.ts
import path from "path";
import { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // 1) Alias para resolver cldr/* desde cldrjs/dist/cldr
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // cualquier import "cldr/..." va a cldrjs/dist/cldr/...
      cldr: path.resolve(__dirname, "node_modules", "cldrjs", "dist", "cldr"),
      "cldr/": path.resolve(__dirname, "node_modules", "cldrjs", "dist", "cldr") + path.sep,
      // para require("cldr")
      "cldr$": path.resolve(
        __dirname,
        "node_modules",
        "cldrjs",
        "dist",
        "cldr",
        "cldr.js"
      ),
    };
    // 2) Silenciar warning de strong-soap/strong-globalize
    config.ignoreWarnings = [
      {
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
};

export default nextConfig;
