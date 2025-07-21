const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {}
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
