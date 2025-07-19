// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Asegura que cualquier import de 'xmljs' vaya a 'xml-js' (pure JS)
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      xmljs: require.resolve('xml-js'),
    };
    return config;
  },
}

module.exports = nextConfig;
