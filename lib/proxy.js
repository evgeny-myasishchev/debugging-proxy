const _ = require('lodash');
const logger = require('./logger').get();
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const storage = require('./storage');
const uuid = require('uuid');
const url = require('url');
const net = require('net');

const proxy = httpProxy.createProxyServer({});

proxy.on('proxyRes', (proxyRes, req) => {
  const reqId = req.reqId;
  const log = req.log;
  storage.writeResponse(req, proxyRes, { reqId, log });
});

function processHttpRequest(req, res) {
  const reqId = uuid.v4();
  const log = logger.child({ reqId, protocol: 'HTTP' });
  req.reqId = reqId; // eslint-disable-line no-param-reassign
  req.log = log; // eslint-disable-line no-param-reassign
  log.debug(`Request started. Proxying to: ${`${req.url}`}`);
  storage.writeRequest(req, { reqId, log });
  proxy.web(req, res, { target: `${req.url}` });
}

function processHttpsRequest(req, res) {
  const reqId = uuid.v4();
  const log = logger.child({ reqId, protocol: 'HTTPS' });
  req.reqId = reqId; // eslint-disable-line no-param-reassign
  req.log = log; // eslint-disable-line no-param-reassign
  const requestUrl = url.resolve(`https://${req.headers.host}`, req.url);
  log.debug(`Request started. Proxying to: ${`${requestUrl}`}`);
  storage.writeRequest(req, { reqId, log });
  proxy.web(req, res, { target: `${requestUrl}` });
}

function processConnect(req, socket) {
  logger.debug(`Receiving reverse proxy request for:${req.url}`);

  const serverUrl = url.parse('https://localhost:8081');

  const srvSocket = net.connect(serverUrl.port, serverUrl.hostname, () => {
    socket.write('HTTP/1.1 200 Connection Established\r\n' +
    'Proxy-agent: Node-Proxy\r\n' +
    '\r\n');
    srvSocket.pipe(socket);
    socket.pipe(srvSocket);
  });
}

function listen(options, cb) {
  const port = options.port;
  logger.debug('Listening on port:', options.port);
  const httpServer = http.createServer(processHttpRequest);
  httpServer.on('connect', processConnect);
  httpServer.listen(port, cb);

  const httpsOpts = _.merge({

  }, options.ssl);
  const httpsServer = https.createServer(httpsOpts, processHttpsRequest);
  httpsServer.listen(port + 1, cb);
}

module.exports = {
  listen,
};
