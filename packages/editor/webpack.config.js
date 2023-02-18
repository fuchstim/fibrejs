/* eslint-disable @typescript-eslint/no-var-requires */
const prod = process.env.NODE_ENV === 'production';

const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: prod ? 'production' : 'development',
  entry: './frontend/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist/html'),
    publicPath: prod ? undefined : '/',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        resolve: {
          extensions: [ '.ts', '.tsx', '.js', '.json', ],
        },
        use: [ {
          loader: 'ts-loader',
          options: {
            configFile: '../tsconfig.webpack.json',
          },
        }, ],
      },
      {
        test: /\.css$/,
        use: [ MiniCssExtractPlugin.loader, 'css-loader', ],
      },
    ],
  },
  devtool: prod ? undefined : 'source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './frontend/public/template.html',
    }),
    new MiniCssExtractPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/config': 'http://localhost:3030',
      '**/config': 'http://localhost:3030',
      '/api/*': 'http://localhost:3030',
      '**/api/*': 'http://localhost:3030',
    },
  },
};
