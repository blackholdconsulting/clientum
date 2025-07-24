// next.config.ts
import { NextConfig } from 'next'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      }
      config.plugins.push(new NodePolyfillPlugin())
    }
    return config
  },
}

export default nextConfig
