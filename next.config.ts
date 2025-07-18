// next.config.js
const { withExpo } = require('@expo/next-adapter'); // si lo usas
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      http: false,
      https: false,
      stream: false,
      crypto: false
    };
    return config;
  }
};

module.exports = withExpo(nextConfig); // o simplemente module.exports = nextConfig;
