// next.config.js
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      // conserva los alias que ya tengas
      ...(config.resolve.alias || {}),

      // alias para que globalize / strong-soap encuentren cldr/event y cldr/supplemental
      'cldr': require.resolve('cldrjs/dist/cldr.js'),
      'cldr/event': require.resolve('cldrjs/dist/cldr/event.js'),
      'cldr/supplemental': require.resolve('cldrjs/dist/cldr/supplemental.js'),
    }
    return config
  },
}

module.exports = nextConfig
