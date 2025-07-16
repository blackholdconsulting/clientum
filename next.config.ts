/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true
  }
}

export default nextConfig
import path from 'path'
import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
  },
  webpack(config) {
    // Alias @ → raíz del proyecto
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    // Soporte .mjs y .cjs
    config.resolve.extensions.push('.mjs', '.cjs')
    return config
  },
}

export default nextConfig
