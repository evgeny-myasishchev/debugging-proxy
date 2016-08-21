const _ = require('lodash');
const async = require('async');
const config = require('config');
const Datastore = require('nedb');
const fs = require('fs');
const logger = require('./logger').get({ module: 'storage' });
const path = require('path');
const url = require('url');

class Storage {
  constructor(streamsDir) {
    // this.db = new Datastore({ filename: config.get('storage.dataFileName'), autoload: true });
    this.db = new Datastore({
      inMemoryOnly: config.get('storage.inMemoryOnly', false),
      filename: config.get('storage.filename'),
    });
    this.streamsDir = streamsDir;
  }

  saveRequest(requestId, request, cb) {
    const log = logger.child({ reqId: requestId });
    const reqUrl = url.parse(request.url);
    const data = {
      host: reqUrl.host,
      method: request.method,
      path: reqUrl.path,
      httpVersion: request.httpVersion,
      headers: _.map(_.chunk(request.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })),
    };
    const reqFilePath = path.join(this.streamsDir, `${requestId}-req.txt`);
    log.debug({ request: data }, 'Saving request');
    async.waterfall([
      (next) => this.db.insert({ _id: requestId, request: data, date: new Date() }, _.unary(next)),
      (next) => {
        log.debug('Piping request body to:', reqFilePath);
        const output = fs.createWriteStream(reqFilePath);
        output.on('close', () => {
          log.debug('Request piped');
          next();
        });
        request.pipe(output);
      },
    ], cb);
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
    this.db.update({ _id: requestId }, { $set: { response: data } }, (numAffected, affectedDocuments) => {
      if (affectedDocuments === 1) return cb(null);
      log.info(`Unexpected number of affected cocuments: ${affectedDocuments}`);
      return cb(new Error(`Failed to save response. Request (id=${requestId}) not found.`));
    });
  }
}

module.exports = Storage;
