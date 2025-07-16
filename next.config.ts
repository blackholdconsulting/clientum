```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      cldr: require.resolve('cldrjs'),
      'cldr/event': require.resolve('cldrjs'),
      globalize: require.resolve('globalize'),
      'globalize/dist/globalize/event': require.resolve('globalize/dist/globalize/event'),
    };
    return config;
  },
};

module.exports = nextConfig;
