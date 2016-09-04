const _ = require('lodash');
const async = require('async');
const Datastore = require('nedb');
const EventEmitter = require('events');
const fs = require('fs');
const logger = require('../lib/logger').get({ module: 'storage' });
const path = require('path');
const url = require('url');

class Storage extends EventEmitter {
  constructor(cfg) {
    super();
    this.db = new Datastore({
      inMemoryOnly: cfg.inMemoryOnly,
      filename: cfg.filename,
      autoload: true,
    });
    this.streamsDir = cfg.streamsDir;
    logger.info(cfg, 'Storage initialized');
  }

  getRequests(cb) {
    return this.db.find({}, cb);
  }

  createRequestBodyStream(reqId) {
    const log = logger.child({ reqId });
    const streamPath = path.join(this.streamsDir, `${reqId}-req.txt`);
    log.debug('Creating request read stream for path:', streamPath);
    return fs.createReadStream(streamPath);
  }

  createResponseBodyStream(reqId) {
    const log = logger.child({ reqId });
    const streamPath = path.join(this.streamsDir, `${reqId}-res.txt`);
    log.debug('Creating response read stream for path:', streamPath);
    return fs.createReadStream(streamPath);
  }

  saveRequest({ requestId, request, host, protocol }, cb) {
    const log = logger.child({ reqId: requestId });
    const reqUrl = url.parse(request.url); // request.url will have the path in most cases but anyway parsing to make sure
    const data = {
      protocol,
      host,
      method: request.method,
      path: reqUrl.path,
      httpVersion: request.httpVersion,
      headers: _.map(_.chunk(request.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })),
    };
    log.debug({ request: data }, 'Saving request');
    const requestData = { _id: requestId, request: data, startedAt: new Date() };
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
      (next) => this.db.insert(requestData, _.unary(next)),
    ], (err) => {
      if (err) return cb(err);
      log.debug('Emitting request-saved');
      this.emit('request-saved', requestData);
      return cb();
    });
  }

  saveResponse(requestId, response, cb) {
    const log = logger.child({ reqId: requestId });
    const data = {
      httpVersion: response.httpVersion,
      statusCode: response.statusCode,
      statusMessage: response.statusMessage,
      headers: _.map(_.chunk(response.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })),
    };
    const responseData = { completedAt: new Date(), response: data };
    log.debug(responseData, 'Saving response');
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
      (next) => this.db.update({ _id: requestId }, { $set: responseData }, (err, numAffected) => {
        if (err) return next(err);
        if (numAffected !== 1) {
          log.info(`Unexpected number of affected cocuments: ${numAffected}`);
          return next(new Error(`Failed to save response. Request (id=${requestId}) not found.`));
        }
        return next();
      }),
    ], (err) => {
      if (err) return cb(err);
      log.debug('Emitting response-saved');
      this.emit('response-saved', _.merge({ _id: requestId }, responseData));
      return cb();
    });
  }

  purge(cb) {
    async.waterfall([
      (next) => this.db.remove({}, { multi: true }, _.unary(next)),
      (next) => fs.readdir(this.streamsDir, next),
      (files, next) => async.each(files, (file, removed) => fs.unlink(path.join(this.streamsDir, file), removed), next),
    ], _.unary(cb));
  }
}

module.exports = Storage;
