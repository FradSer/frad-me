const million = require('million/compiler')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    return config
  },
}

module.exports = withBundleAnalyzer(million.next(nextConfig))
