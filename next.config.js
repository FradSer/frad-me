const million = require('million/compiler');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Exclude test files from TypeScript compilation during build
    ignoreBuildErrors: false,
  },
  // Define file extensions for pages, including MDX
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  // Exclude test files from bundling
  outputFileTracingExcludes: {
    '*': ['./tests/**/*'],
  },
  transpilePackages: [
    '@react-three/fiber',
    '@react-three/xr',
    '@react-three/drei',
    'three',
    'three-stdlib',
  ],
  // Turbopack configuration for Next.js 16
  // Note: Bundle analyzer (ANALYZE=true) requires webpack mode
  // Run with: pnpm run build -- --webpack for bundle analysis
  turbopack: {
    // Turbopack handles @bufbuild/protobuf dependencies automatically
    // No special configuration needed
  },
};

module.exports = withBundleAnalyzer(million.next(nextConfig));
