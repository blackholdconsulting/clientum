// next.config.js
const path = require('path');

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // el alias "xmljs" apunta al paquete "xml-js"
      xmljs: require.resolve('xml-js'),
    };
    return config;
  },
};
