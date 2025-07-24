// next.config.js
/** @type {import('next').NextConfig} */
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin').default;

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Añadimos los fallbacks para crypto y stream en el browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      };
      // Y ahora sí podemos instanciar el plugin
      config.plugins.push(new NodePolyfillPlugin());
    }
    return config;
  },
};