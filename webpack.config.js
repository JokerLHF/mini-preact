const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  devtool: '#cheap-module-eval-source-map',

  mode: 'development',

  target: 'web',

  entry: {
    main: path.resolve(__dirname, './example/index.js'),
  },

  devServer: {
    host: '0.0.0.0',
    port: 8050,
    hot: true
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-syntax-dynamic-import',
            [
              "@babel/plugin-transform-react-jsx",
              {
                pragma: 'h'
              }
            ],
            "@babel/plugin-proposal-class-properties",
          ]
        }
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }
    ],

  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './public/index.html')
    })
  ]
}