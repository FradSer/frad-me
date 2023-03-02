/**
 * @type {import('next').NextConfig}
 */

const withTM = require('next-transpile-modules')([
  '@react-three/fiber',
  '@react-three/xr',
  '@react-three/drei',
  'three',
  'three-stdlib',
])

const nextConfig = {
  reactStrictMode: true,
}

module.exports = withTM(nextConfig)
