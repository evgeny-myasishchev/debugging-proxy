process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('config');
const fs = require('fs');
const proxy = require('./lib/proxyv2');
const Storage = require('./lib/Storage');

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
proxy.startServer(storage, opts, (error) => {
  if (error) throw error;
});
