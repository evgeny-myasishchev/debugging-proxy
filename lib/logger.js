const config = require('config');
const bunyan = require('bunyan');

const root = bunyan.createLogger({
  level: 'debug',
  name: config.get('log.name'),
});

module.exports = {
  get(params = {}) {
    return root.child(params);
  },
};
