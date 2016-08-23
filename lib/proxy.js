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

function forwardRequest(targetUrl, proxy, storage, req, res) {
  const targetUrlStr = `${targetUrl.protocol}//${targetUrl.host}`;
  const reqId = uuid.v4();
  const log = logger.child({ reqId, protocol: targetUrl.protocol });
  req.reqId = reqId; // eslint-disable-line no-param-reassign
  req.log = log; // eslint-disable-line no-param-reassign
  log.debug(`Request started. Saving and forwarding to: ${`${targetUrlStr}`}`);
  storage.saveRequest(reqId, req, _.curry(handleSaveError, log));
  proxy.web(req, res, { target: targetUrlStr });
}

function processHttpRequest(proxy, storage, req, res) {
  forwardRequest(url.parse(req.url), proxy, storage, req, res);
}

function processHttpsRequest(proxy, storage, req, res) {
  forwardRequest(url.parse(`https://${req.headers.host}`), proxy, storage, req, res);
}

function processConnect(config, req, socket) {
  const serverUrl = url.parse(`https://localhost:${config.httpsPort}`);
  logger.debug({
    url: req.url,
    headers: req.headers,
    decodingServerUrl: serverUrl.format(),
  }, 'Receiving CONNECT proxy request. Forwarding it to decoding server');

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
