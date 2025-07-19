// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Cuando strong-soap/globalize requiera "cldr", "cldr/event" o "cldr/supplemental"
    // los aliasarán a cldrjs, que sí estará instalado.
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      cldr: require.resolve('cldrjs'),
      'cldr/event': require.resolve('cldrjs/dist/cldr/event'),
      'cldr/supplemental': require.resolve('cldrjs/dist/cldr/supplemental'),
    };
    return config;
  },
};

export default nextConfig;
