/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // opcional: si tienes strong-soap/globalize, habilita estos fallbacks:
    Object.assign(config.resolve.fallback, {
      cldr: require.resolve('cldrjs'),
      'cldr/event': require.resolve('globalize/dist/globalize/event'),
      globalize: require.resolve('globalize'),
    });
    return config;
  },
};

module.exports = nextConfig;
