const logger = require('./logger').get();
const http = require('http');
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

function processRequest(req, res) {
  const reqId = uuid.v4();
  const log = logger.child({ reqId });
  req.reqId = reqId; // eslint-disable-line no-param-reassign
  req.log = log; // eslint-disable-line no-param-reassign
  log.debug(`Request started. Proxying to: ${`${req.url}`}`);
  storage.writeRequest(req, { reqId, log });
  proxy.web(req, res, { target: `${req.url}` });
}

function processConnect(req, socket) {
  logger.debug(`Receiving reverse proxy request for:${req.url}`);

  const serverUrl = url.parse(`https://${req.url}`);

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
  const server = http.createServer(processRequest);
  server.on('connect', processConnect);

  server.listen(port, cb);
}

module.exports = {
  listen,
};
