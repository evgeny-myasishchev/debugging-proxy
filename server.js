const config = require('config');
const protocolHandler = require('./protocolHandler');

protocolHandler.start(config.port, (error) => {
  if (error) throw error;
});
