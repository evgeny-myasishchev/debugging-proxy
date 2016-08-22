module.exports = {
  port: 54001,
  httpsPort: process.env.HTTPS_PORT || 54443,
  log: {
    stdout: false,
    file: 'test.log',
  },
  storage: {
    filename: false,
    inMemoryOnly: true,
  },
};
