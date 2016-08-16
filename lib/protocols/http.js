const log = require('../logger').get({ protocol: 'HTTP' });

function handle(socket) {
  log.debug('Handling socket. Address:', socket.address());
}

module.exports = {
  handle,
};
