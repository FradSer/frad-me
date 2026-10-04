import bundleAnalyzer from '@next/bundle-analyzer';
import createMDX from '@next/mdx';
import million from 'million/compiler';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  cacheComponents: true,
};

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
  },
});

export default withMDX(withBundleAnalyzer(million.next(nextConfig)));
