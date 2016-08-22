const _ = require('lodash');
const async = require('async');
const fs = require('fs');
const http = require('http');
const httpProxy = require('http-proxy');
const https = require('https');
const logger = require('./logger').get();
const net = require('net');
const url = require('url');
const uuid = require('uuid');

// TODO: Handle protocol

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

function processHttpsRequest(proxy, storage, req, res) {
  const reqId = uuid.v4();
  const log = logger.child({ reqId, protocol: 'HTTPS' });
  req.reqId = reqId; // eslint-disable-line no-param-reassign
  req.log = log; // eslint-disable-line no-param-reassign
  const requestUrl = url.resolve(`https://${req.headers.host}`, req.url);
  log.debug(`Request decoded. Saving and proxying to: ${`${requestUrl}`}`);
  storage.saveRequest(reqId, req, _.curry(handleSaveError, log));
  proxy.web(req, res, { target: `${requestUrl}`, seure: false });
}

function processConnect(config, req, socket) {
  logger.debug(`Receiving reverse proxy request for:${req.url}`);

  const serverUrl = url.parse(`https://localhost:${config.httpsPort}`);

  const srvSocket = net.connect(serverUrl.port, serverUrl.hostname, () => {
    socket.write('HTTP/1.1 200 Connection Established\r\n' +
    'Proxy-agent: Node-Proxy\r\n' +
    '\r\n');
    srvSocket.pipe(socket);
    socket.pipe(srvSocket);
  });
}

function startServer(storage, config, cb) {
  const port = config.port;
  const httpsPort = config.httpsPort;

  const proxy = httpProxy.createProxyServer({ secure: config.verifyHttpsCertificate });
  proxy.on('proxyRes', _.curry(processResponse)(storage));
  proxy.on('error', (err) => {
    logger.error('Proxy error occured', err);
    throw err;
  });

  const httpServer = http.createServer(_.curry(processHttpRequest)(proxy, storage));
  httpServer.on('connect', _.curry(processConnect)(config));

  const httpsCfg = {
    key: fs.readFileSync(config.ssl.key),
    cert: fs.readFileSync(config.ssl.cert),
  };
  const httpsServer = https.createServer(httpsCfg, _.curry(processHttpsRequest)(proxy, storage));

  async.waterfall([
    (next) => {
      logger.info('Proxy listening on port:', port);
      httpServer.listen(port, next);
    },
    (next) => {
      logger.debug('Starting decoding HTTPS server on port:', httpsPort);
      httpsServer.listen(httpsPort, next);
    },
  ], (err) => {
    if (err) return cb(err);
    return cb(null, {
      close: (cb1) => {
        async.parallel([
          (next) => httpServer.close(next),
          (next) => httpsServer.close(next),
        ], cb1);
      },
    });
  });
}

module.exports = {
  startServer,
};
