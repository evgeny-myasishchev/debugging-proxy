const logger = require('../logger').get({ protocol: 'HTTP' });
const http = require('http');
const httpProxy = require('http-proxy');
const storage = require('../storage');
const uuid = require('uuid');

const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  const reqId = uuid.v4();
  const log = logger.child({ reqId });
  req.reqId = uuid.v4(); // eslint-disable-line no-param-reassign
  req.log = log; // eslint-disable-line no-param-reassign
  log.debug(`Request started. Proxying to: ${`${req.url}`}`);
  storage.writeRequest(req, { reqId, log });
  proxy.web(req, res, { target: `${req.url}` });
});

proxy.on('proxyRes', (proxyRes, req) => {
  const reqId = req.reqId;
  const log = req.log;
  storage.writeResponse(req, proxyRes, { reqId, log });
});

function listen(port, cb) {
  logger.debug('Listening on port:', port);
  server.listen(port, cb);
}

module.exports = {
  listen,
};
