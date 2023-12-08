const million = require('million/compiler')

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
}

module.exports = million.next(nextConfig)
