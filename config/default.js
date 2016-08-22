module.exports = {
  port: process.env.PORT || 8080,
  httpsPort: process.env.HTTPS_PORT || 44443,
  ssl: {
    key: './config/ssl/key.pem',
    cert: './config/ssl/cert.pem',
  },
  log: {
    name: 'DEBUGGING-PROXY',
    stdout: true,
    file: null,
  },
  storage: {
    filename: 'var/data.db',
    streamsDir: 'var/streams',
    inMemoryOnly: false,
  },
};
