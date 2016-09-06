module.exports = {
  apiPort: 3000,
  port: process.env.PORT || 8080, // TOOD: Rename to proxyPort
  httpsPort: process.env.HTTPS_PORT || 44443, // TOOD: decodingHttpsPort
  verifyHttpsCertificate: true,
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
  ui: {
    devToolsEnabled: true,
  },
};
