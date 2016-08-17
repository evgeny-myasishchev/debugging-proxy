const logger = require('../logger').get({ protocol: 'HTTP' });
const http = require('http');
const httpProxy = require('http-proxy');
const storage = require('../storage');
const uuid = require('uuid');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  const reqId = req.headers['x-request-id'] || uuid.v4();
  const log = logger.child({ reqId });
  log.debug(`Request started. Proxying to: ${`${req.url}`}`);
  req._options = { reqId, log };
  storage.writeRequest(req, req._options);
  proxy.web(req, res, { target: `${req.url}` });
});

proxy.on('proxyRes', (proxyRes, req) => {
  storage.writeResponse(req, proxyRes, req._options);
});

function listen(port, cb) {
  logger.debug('Listening on port:', port);
  server.listen(port, cb);
}

module.exports = {
  listen,
};
