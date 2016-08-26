const path = require('path');
const express = require('express');
const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies
const webpackMiddleware = require('webpack-dev-middleware');  // eslint-disable-line import/no-extraneous-dependencies
const webpackHotMiddleware = require('webpack-hot-middleware'); // eslint-disable-line import/no-extraneous-dependencies
const config = require('../../webpack.config');

function create(logger) {
  logger.debug('Creating ui controller');
  const router = new express.Router();

  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  });

  router.use(middleware);
  router.use(webpackHotMiddleware(compiler));

  router.get('*', (req, res) => {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, '../../public/index.html')));
    res.end();
  });

  return router;
}

module.exports = {
  create,
};
