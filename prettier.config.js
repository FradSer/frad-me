/** @type {import("prettier").Config} */
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
    '^next/(.*)$',
    '^@next$',
    '^@vercel',
    '<THIRD_PARTY_MODULES>',
    '^[./]',
    '^@/pages/(.*)$',
    '^@/components/(.*)$',
    '^@/hooks/(.*)$',
    '^@/contexts/(.*)$',
    '^@/utils/(.*)$',
    '^@/content/(.*)$',
    '^@/styles/(.*)$',
  ],
  importOrderSeparation: true,
  importOrderTypeImportsToBottom: true,
  plugins: [
    'prettier-plugin-tailwindcss',
    '@serverless-guru/prettier-plugin-import-order',
  ],
}
