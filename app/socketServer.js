const io = require('socket.io');
const logger = require('./lib/logger').get({ module: 'socket-server' });

function handleConnections(socketServer, storage) {
  const connections = [];
  socketServer.on('connection', socket => {
    logger.debug({ id: socket.id }, 'Client connected');
    connections.push(socket);

    socket.on('disconnect', () => {
      const index = connections.indexOf(socket);
      logger.debug({ id: socket.id }, 'Client disconnected');
      connections.splice(index, 1);
    });
  });

  storage.on('request-saved', (data) => {
    connections.forEach(socket => {
      logger.debug({ id: socket.id }, 'Notifying client on request-saved');
      socket.emit('request-saved', data);
    });
  });

  storage.on('response-saved', (data) => {
    connections.forEach(socket => {
      logger.debug({ id: socket.id }, 'Notifying client on response-saved');
      socket.emit('response-saved', data);
    });
  });
}

function start(httpServer, storage) {
  const socketServer = io(httpServer);
  handleConnections(socketServer, storage);
}

module.exports = {
  start,
  _handleConnections: handleConnections,
};
