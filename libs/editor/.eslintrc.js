module.exports = {
  extends: [
    '../../.eslintrc.js',
    'plugin:react/recommended',
  ],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'react/prop-types': [ 0, ],
  },
};
