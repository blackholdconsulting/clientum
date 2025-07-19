// next.config.js
/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Alias de cldr que globalize/strong-soap esperan
      cldr: require.resolve('cldrjs'),
      'cldr/event': require.resolve('cldrjs/dist/cldr/event.js'),
      'cldr/supplemental': require.resolve('cldrjs/dist/cldr/supplemental.js'),
    }
    return config
  },
}

module.exports = nextConfig
