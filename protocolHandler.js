const net = require('net');
const log = require('./lib/logger').get();
const httpHandler = require('./lib/protocols/http').handle;

const handlers = {
  http: httpHandler,
};

const server = net.createServer((socket) => {
  log.info('Client connected', socket.address());
  handlers.http(socket);
  socket.end('Good bye');
});

function start(port, cb) {
  log.info(`Starting on port: ${port}`);
  const opts = {
    port,
  };
  server.listen(opts, () => {
    const address = server.address();
    log.info('Server started:', address);
    cb();
  });
}

function stop(cb) {
  log.info('Stopping server');
  server.close(cb);
}

module.exports = {
  start,
  stop,
};
