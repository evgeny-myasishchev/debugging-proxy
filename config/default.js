module.exports = {
  port: process.env.PORT || 8080,
  ssl: {
    key: './test/values/key.pem',
    cert: './test/values/cert.pem',
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
