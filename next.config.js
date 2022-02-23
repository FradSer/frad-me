const withTM = require('next-transpile-modules')([
  '@react-three/fiber',
  '@react-three/xr',
  '@react-three/drei',
  'three',
  'three-stdlib',
]);

module.exports = {
  reactStrictMode: true,
};

module.exports = withTM();
