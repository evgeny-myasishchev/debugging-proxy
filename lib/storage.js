const fs = require('fs');
const path = require('path');
const logger = require('./logger').get();

const tmp = path.resolve(__dirname, '..', 'tmp');

function appendHeaders(output, rawHeaders) {
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const name = rawHeaders[i];
    const value = rawHeaders[i + 1];
    output.splice(output.length, 4, name, ': ', value, '\n');
  }
}

function writeRequest(req, opts) {
  const log = opts.log || logger;
  const outputPath = path.join(tmp, `${opts.reqId}-req.txt`);
  const output = fs.createWriteStream(outputPath);
  log.debug('Saving request to:', outputPath);

  const header =
    // Request line (e.g: GET http://google.com HTTP/1.1)
    [req.method, ' ', req.url, ' HTTP/', req.httpVersion, '\n'];

  // HTTP Headers
  appendHeaders(header, req.rawHeaders);
  header.push('\n');
  output.write(header.join(''));

  // Body
  req.pipe(output);
}

function writeResponse(req, res, opts) {
  const log = opts.log || logger;

  const outputPath = path.join(tmp, `${opts.reqId}-res.txt`);
  const output = fs.createWriteStream(outputPath);
  log.debug('Saving response to:', outputPath);

  const header =
    // Status line (e.g: HTTP/1.1 404 Not Found)
    ['HTTP/', res.httpVersion, ' ', res.statusCode, ' ', res.statusMessage, '\n'];

  // HTTP Headers
  appendHeaders(header, res.rawHeaders);
  header.push('\n');
  output.write(header.join(''));

  res.pipe(output);
}


module.exports = {
  writeRequest,
  writeResponse,
};
