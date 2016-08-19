process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const config = require('config');
const fs = require('fs');
const proxy = require('./lib/proxy');

const opts = {
  port: config.port,
  ssl: {
    key: fs.readFileSync(config.get('ssl.key')),
    cert: fs.readFileSync(config.get('ssl.cert')),
  },
};
proxy.listen(opts, (error) => {
  if (error) throw error;
});
