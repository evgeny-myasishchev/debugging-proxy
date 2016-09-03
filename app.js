const _ = require('lodash');
const uiController = require('./app/controllers/uiController');
const async = require('async');
const bunyanMiddleware = require('bunyan-middleware');
const config = require('config');
const express = require('express');
const fs = require('fs');
const logger = require('./app/lib/logger').get();
const proxy = require('./app/proxy');
const requestsController = require('./app/controllers/requestsController');
const Storage = require('./app/models/Storage');
const socketServer = require('./app/socketServer');

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

function startAppLayer(storage, options, cb) {
  const apiLogger = logger.child({ module: 'app' });
  const app = express();
  app.use(bunyanMiddleware(
    {
      headerName: 'X-Request-Id',
      propertyName: 'reqId',
      logName: 'reqId',
      requestStart: true,
      logger: apiLogger,
    }));
  if (_.get(options, 'withApiLayer', true)) {
    app.use(requestsController.create(storage, apiLogger));
  }
  if (_.get(options, 'withUiLayer', true)) {
    app.use(uiController.create(apiLogger));
  }
  apiLogger.info('Starting APP layer on port:', config.apiPort);
  const server = app.listen(config.apiPort);
  return cb(null, server);
}

function startSocketServer(httpServer, storage) {
  logger.info('Starting socket server');
  socketServer.start(httpServer, storage);
}

function start(cb) {
  const storage = new Storage(config.get('storage'));
  async.series([
    async.apply(startProxy, storage),
    (next) => startAppLayer(storage, {}, (err, httpServer) => {
      startSocketServer(httpServer, storage);
      next();
    }),
  ], cb);
}

module.exports = {
  startProxy,
  startAppLayer,
  start,
};
