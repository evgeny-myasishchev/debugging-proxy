const _ = require('lodash');
const logger = require('./logger').get({ module: 'storage' });
const url = require('url');

class Storage {
  constructor(db, streamsDir) {
    this.db = db;
    this.streamsDir = streamsDir;
  }

  saveRequest(requestId, request, cb) {
    const log = logger.child({ reqId: requestId });
    const reqUrl = url.parse(request.url);
    const data = {
      host: reqUrl.host,
      method: request.method,
      httpVersion: request.httpVersion,
      headers: _.map(_.chunk(request.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })),
    };
    log.debug({ request }, 'Saving request');
    // TODO: Save body to streamsDir (file name is requestId)
    this.db.put(requestId, { request: data, date: new Date() }, cb);
  }

  saveResponse(requestId, response, cb) {
    const log = logger.child({ reqId: requestId });
    const data = {
      httpVersion: response.httpVersion,
      statusCode: response.statusCode,
      statusMessage: response.statusMessage,
      headers: _.map(_.chunk(response.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })),
    };
    log.debug({ response }, 'Saving response');
    // TODO: Save body to streamsDir (file name is requestId)
    this.db.put(requestId, { response: data }, cb);
  }
}

Storage.DB_OPTIONS = {
  createIfMissing: true,
  errorIfExists: true,
  valueEncoding: { encode: JSON.stringify, decode: JSON.parse },
};

module.exports = Storage;
