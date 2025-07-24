// next.config.js
/** @type {import('next').NextConfig} */
const { NodePolyfillPlugin } = require('node-polyfill-webpack-plugin');

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallbacks para que crypto y stream funcionen en el bundle del navegador
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      };
      // Añadimos el plugin
      config.plugins.push(new NodePolyfillPlugin());
    }
    return config;
  },
};
