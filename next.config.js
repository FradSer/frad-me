const withMDX = require('@next/mdx')();

const withTM = require('next-transpile-modules')([
  '@react-three/fiber',
  '@react-three/xr',
  '@react-three/drei',
  'three',
]);

module.exports = {
  reactStrictMode: true,
};

module.exports = withMDX();
module.exports = withTM();
