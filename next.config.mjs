/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@resvg/resvg-js', 'sharp'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize native modules to prevent webpack from bundling them
      config.externals.push({
        '@resvg/resvg-js': 'commonjs @resvg/resvg-js',
        'sharp': 'commonjs sharp',
      })
    }
    
    // Add rule to handle .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    })
    
    return config
  },
}

export default nextConfig
