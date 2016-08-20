module.exports = {
  port: process.env.PORT || 8080,
  log: {
    name: 'DEBUGGING-PROXY',
    stdout: true,
    file: null,
  },
  storage: {
    streamsDir: 'var/streams',
    dataFileName: 'var/data.db',
  },
};
