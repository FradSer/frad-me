module.exports = {
  parser: 'typescript',
  arrowParens: 'always',
  singleQuote: true,
  tabWidth: 2,
  printWidth: 80,
  semi: false,
  overrides: [
    {
      files: ['*.json'],
      options: {
        parser: 'json',
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        parser: 'markdown',
      },
    },
  ],
  importOrder: [
    '^react$',
    '^next$',
    '^@next$',
    '<THIRD_PARTY_MODULES>',
    '^[./]',
    '^@/pages/(.*)$',
    '^@/components/(.*)$',
    '^@/utils/(.*)$',
    '^@/styles/(.*)$',
  ],
  importOrderSeparation: true,
  importOrderTypeImportsToBottom: true,
  plugins: [
    require('prettier-plugin-tailwindcss'),
    require('@serverless-guru/prettier-plugin-import-order'),
  ],
}
