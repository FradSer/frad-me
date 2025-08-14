const million = require('million/compiler')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Exclude test files from TypeScript compilation during build
    ignoreBuildErrors: false,
  },
  // Exclude test directories from build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  experimental: {
    // Exclude test files from bundling
    outputFileTracingExcludes: {
      '*': ['./tests/**/*'],
    },
  },
  transpilePackages: [
    '@react-three/fiber',
    '@react-three/xr',
    '@react-three/drei',
    'three',
    'three-stdlib',
  ],
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      console.log(`Bundle analysis enabled for ${isServer ? 'server' : 'client'} build`)
    }
    
    // Fix for @bufbuild/protobuf missing dependency in WebXR packages
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@bufbuild/protobuf/wire': false,
    }
    
    return config
  },
}

module.exports = withBundleAnalyzer(million.next(nextConfig))
