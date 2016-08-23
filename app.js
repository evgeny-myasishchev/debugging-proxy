const async = require('async');
const config = require('config');
const fs = require('fs');
const proxy = require('./app/proxy');
const Storage = require('./app/models/Storage');

function startProxy(cb) {
  const opts = {
    port: config.port,
    httpsPort: config.httpsPort,
    ssl: {
      key: config.get('ssl.key'),
      cert: config.get('ssl.cert'),
    },
  };

  const streamsDir = config.get('storage.streamsDir');
  try {
    fs.mkdirSync(streamsDir);
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }

  const storage = new Storage(config.get('storage'));
  proxy.startServer(storage, opts, cb);
}

function start(cb) {
  async.series([
    async.apply(startProxy),
  ], cb);
}

module.exports = {
  startProxy,
  start,
};
