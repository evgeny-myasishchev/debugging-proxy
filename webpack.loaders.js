module.exports = [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
  },
  // TODO: enable
  // {
  //   test: /[\/\\](node_modules)[\/\\].*\.css$/,
  //   loaders: [
  //     'style?sourceMap',
  //     'css',
  //   ],
  // },
  {
    test: /\.css$/,
    loaders: ['style', 'css'],
  },
  {
    test: /\.eot(\?.*)?$/,
    loader: 'file',
  },
  {
    test: /\.(woff|woff2)(\?.*)$/,
    loader: 'url?prefix=font/&limit=5000',
  },
  {
    test: /\.ttf(\?.*)?$/,
    loader: 'url?limit=10000&mimetype=application/octet-stream',
  },
  {
    test: /\.svg(\?.*)?$/,
    loader: 'url?limit=10000&mimetype=image/svg+xml',
  },
  {
    test: /\.gif(\?.*)?/,
    loader: 'url-loader?limit=10000&mimetype=image/gif',
  },
  {
    test: /\.jpg(\?.*)?/,
    loader: 'url-loader?limit=10000&mimetype=image/jpg',
  },
  {
    test: /\.png(\?.*)?/,
    loader: 'url-loader?limit=10000&mimetype=image/png',
  },
];
