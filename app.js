const async = require('async');
const config = require('config');
const express = require('express');
const fs = require('fs');
const proxy = require('./app/proxy');
const requestsController = require('./app/controllers/requestsController');
const Storage = require('./app/models/Storage');
const logger = require('./app/lib/logger').get();
const bunyanMiddleware = require('bunyan-middleware');

function startProxy(storage, cb) {
  const opts = {
    port: config.port,
    httpsPort: config.httpsPort,
    ssl: {
      key: config.get('ssl.key'),
      cert: config.get('ssl.cert'),
    },
  };

  const streamsDir = config.get('storage.streamsDir');
  try {
    fs.mkdirSync(streamsDir);
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }

  proxy.startServer(storage, opts, cb);
}

function startApiLayer(storage, cb) {
  const apiLogger = logger.child({ module: 'api' });
  const app = express();
  app.use(bunyanMiddleware(
    {
      headerName: 'X-Request-Id',
      propertyName: 'reqId',
      logName: 'reqId',
      requestStart: true,
      logger: apiLogger,
    }));
  app.use(requestsController.create(storage));
  apiLogger.info('Starting API layer on port:', config.apiPort);
  const server = app.listen(config.apiPort);
  return cb(null, server);
}

function start(cb) {
  const storage = new Storage(config.get('storage'));
  async.series([
    async.apply(startProxy, storage),
    async.apply(startApiLayer, storage),
  ], cb);
}

module.exports = {
  startProxy,
  startApiLayer,
  start,
};
