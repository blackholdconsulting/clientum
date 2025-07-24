// next.config.js
/** @type {import('next').NextConfig} */
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');

const nextConfig = {
  webpack: (config, { isServer }) => {
    // fallbacks para navegador
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
    };

    // solo en bundle de cliente
    if (!isServer) {
      config.plugins.push(new NodePolyfillPlugin());
    }

    return config;
  },
};

module.exports = nextConfig;
