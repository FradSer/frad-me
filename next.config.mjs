import bundleAnalyzer from '@next/bundle-analyzer';
import createMDX from '@next/mdx';
import million from 'million/compiler';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
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
  cacheComponents: true,
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: [],
  },
});

export default withMDX(withBundleAnalyzer(million.next(nextConfig)));
