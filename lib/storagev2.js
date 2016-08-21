const _ = require('lodash');
const async = require('async');
const Datastore = require('nedb');
const fs = require('fs');
const logger = require('./logger').get({ module: 'storage' });
const path = require('path');
const url = require('url');

class Storage {
  constructor(cfg) {
    // this.db = new Datastore({ filename: config.get('storage.dataFileName'), autoload: true });
    this.db = new Datastore({
      inMemoryOnly: cfg.inMemoryOnly,
      filename: cfg.filename,
      autoload: true,
    });
    this.streamsDir = cfg.streamsDir;
    logger.info(cfg, 'Storage initialized');
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
    log.debug({ request: data }, 'Saving request');
    async.parallel([ // Has to be in parallel in order to have pipe started quickly
      (next) => {
        const reqFilePath = path.join(this.streamsDir, `${requestId}-req.txt`);
        log.debug('Piping request body to:', reqFilePath);
        const output = fs.createWriteStream(reqFilePath);
        output.on('error', next);
        output.on('close', () => {
          log.debug('Request piped');
          next();
        });
        request.pipe(output);
      },
      (next) => this.db.insert({ _id: requestId, request: data, date: new Date() }, _.unary(next)),
    ], _.unary(cb));
  }

  saveResponse(requestId, response, cb) {
    const log = logger.child({ reqId: requestId });
    const data = {
      httpVersion: response.httpVersion,
      statusCode: response.statusCode,
      statusMessage: response.statusMessage,
      headers: _.map(_.chunk(response.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })),
    };
    log.debug({ response: data }, 'Saving response');
    async.parallel([ // Has to be in parallel in order to have pipe started quickly
      (next) => {
        const resFilePath = path.join(this.streamsDir, `${requestId}-res.txt`);
        log.debug('Piping response body to:', resFilePath);
        const output = fs.createWriteStream(resFilePath);
        output.on('error', next);
        output.on('close', () => {
          log.debug('Response piped');
          next();
        });
        return response.pipe(output);
      },
      (next) => this.db.update({ _id: requestId }, { $set: { response: data } }, (err, numAffected) => {
        if (err) return next(err);
        if (numAffected !== 1) {
          log.info(`Unexpected number of affected cocuments: ${numAffected}`);
          return next(new Error(`Failed to save response. Request (id=${requestId}) not found.`));
        }
        return next();
      }),
    ], _.unary(cb));
  }
}

module.exports = Storage;
