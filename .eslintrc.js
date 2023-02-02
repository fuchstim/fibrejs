module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  ignorePatterns: [ '**/proto/**', ],
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'no-nested-ternary': 'error',
    'no-unneeded-ternary': 'error',
    'multiline-ternary': [
      'error',
      'never',
    ],
    'require-await': 'off',
    'eol-last': [
      'error',
      'always',
    ],
    'object-shorthand': [
      'error',
      'properties',
    ],
    'indent-legacy': [
      'warn',
      2,
      {
        'SwitchCase': 1,
      },
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'semi': 'off',
    'rest-spread-spacing': [
      'error',
    ],
    'no-trailing-spaces': [
      'error',
    ],
    'spaced-comment': [
      'error',
      'always',
    ],
    'object-curly-spacing': [
      'error',
      'always',
    ],
    'curly': [
      2,
    ],
    'keyword-spacing': [
      'error',
      {
        'before': true,
        'after': true,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        'vars': 'all',
        'args': 'none',
      },
    ],
    'brace-style': [
      'error',
      '1tbs',
      {
        'allowSingleLine': true,
      },
    ],
    'max-len': [
      'warn',
      {
        'code': 130,
        'ignoreStrings': true,
        'ignoreTemplateLiterals': true,
        'ignoreTrailingComments': true,
        'ignoreComments': true,
      },
    ],
    'no-useless-escape': [
      'warn',
    ],
    'no-multiple-empty-lines': [
      'error',
      {
        'max': 1,
      },
    ],
    'no-multi-spaces': [
      'error',
      {
        'ignoreEOLComments': true,
      },
    ],
    'no-return-await': 'error',
    'space-in-parens': [
      'error',
      'never',
    ],
    'space-before-blocks': 'error',
    'space-before-function-paren': [
      'error',
      {
        'anonymous': 'always',
        'named': 'never',
        'asyncArrow': 'always',
      },
    ],
    'comma-dangle': [
      'error',
      {
        'arrays': 'always',
        'objects': 'always',
        'imports': 'never',
        'exports': 'never',
        'functions': 'never',
      },
    ],
    'array-bracket-spacing': [ 'error', 'always', ],
    'comma-spacing': [ 'error', { 'before': false, 'after': true, }, ],
    '@typescript-eslint/semi': [ 'error', 'always', ],
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
};
