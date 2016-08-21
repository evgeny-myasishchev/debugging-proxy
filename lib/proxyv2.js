const _ = require('lodash');
const http = require('http');
const httpProxy = require('http-proxy');
// const https = require('https');
const logger = require('./logger').get();
// const net = require('net');
// const url = require('url');
const uuid = require('uuid');

let httpServer;

function handleSaveError(log, err) {
  if (err) {
    log.error('Saving failed', err);
    throw err; // TODO: Investigate this. Maybe signal somehow differently...
  }
}

function processResponse(storage, proxyRes, req) {
  const reqId = req.reqId;
  const log = req.log;
  storage.saveResponse(reqId, proxyRes, _.curry(handleSaveError)(log));
}

function processHttpRequest(proxy, storage, req, res) {
  const reqId = uuid.v4();
  const log = logger.child({ reqId, protocol: 'HTTP' });
  req.reqId = reqId; // eslint-disable-line no-param-reassign
  req.log = log; // eslint-disable-line no-param-reassign
  log.debug(`Request started. Proxying to: ${`${req.url}`}`);
  storage.saveRequest(reqId, req, _.curry(handleSaveError, log));
  proxy.web(req, res, { target: `${req.url}` });
}

function listen(storage, config, cb) {
  const port = config.port;
  logger.debug('Listening on port:', port);

  const proxy = httpProxy.createProxyServer({});
  proxy.on('proxyRes', _.curry(processResponse)(storage));

  httpServer = http.createServer(_.curry(processHttpRequest)(proxy, storage));
  httpServer.listen(port, cb);
}

function close(cb) {
  httpServer.close(cb);
}

module.exports = {
  listen, close,
};
