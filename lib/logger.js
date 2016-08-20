const config = require('config');
const bunyan = require('bunyan');

const logCfg = config.get('log');

const streams = [];
if (logCfg.get('stdout')) streams.push({ stream: process.stdout });
if (logCfg.get('file')) streams.push({ path: logCfg.get('file') });

const root = bunyan.createLogger({
  level: 'debug',
  name: logCfg.get('name'),
  streams,
});

module.exports = {
  get(params = {}) {
    return root.child(params);
  },
};
