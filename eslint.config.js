const globals = require('globals')
const tseslint = require('typescript-eslint')
const pluginReactConfig = require('eslint-plugin-react/configs/recommended.js')

const path = require('path')
const url = require('url')
const FlatCompat = require('@eslint/eslintrc').FlatCompat
const pluginJs = require('@eslint/js')

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
})

module.exports = [
  { languageOptions: { globals: globals.browser } },
  ...compat.extends('standard-with-typescript'),
  ...tseslint.configs.recommended,
  pluginReactConfig,
]
