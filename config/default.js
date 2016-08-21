module.exports = {
  port: process.env.PORT || 8080,
  log: {
    name: 'DEBUGGING-PROXY',
    stdout: true,
    file: null,
  },
  storage: {
    filename: 'var/data.db',
  },
};
