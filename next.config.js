/** @type {import('next').NextConfig} */
const nextConfig = {
  // API URL is handled in lib/api.ts based on environment

  // Performance optimizations for faster builds
  swcMinify: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Optimize package imports - tree shake better
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@radix-ui/react-slot', 'react-big-calendar'],
    // Use faster compiler
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Speed up webpack compilation
  webpack: (config, { dev, isServer }) => {
    // Disable source maps in development for faster builds
    if (dev && !isServer) {
      config.devtool = 'eval-cheap-module-source-map'
    }

    // Optimize chunk splitting
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Split vendor code
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Split common code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Split framer-motion separately (it's large)
            framerMotion: {
              name: 'framer-motion',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      }
    }

    return config
  },

  // Reduce build memory usage
  typescript: {
    // Don't type check during build - do it separately
    ignoreBuildErrors: false,
  },

  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize images
  images: {
    formats: ['image/webp'],
  },
}

module.exports = nextConfig
