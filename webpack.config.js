/* eslint-disable import/no-extraneous-dependencies */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const validate = require('webpack-validator');
const webpack = require('webpack');
const loaders = require('./webpack.loaders');

module.exports = validate({
  entry: [
    'webpack-hot-middleware/client?reload=true',
    './app/ui/index.jsx',
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].js',
  },
  module: {
    loaders,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'app', 'ui', 'index.ejs'),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
  ],
});
