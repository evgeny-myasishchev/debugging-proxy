const httpProtocol = require('./lib/protocols/http');

const protocols = {
  http: httpProtocol,
};

function start(port, cb) {
  protocols.http.listen(port, cb);
}

module.exports = {
  start,
};
