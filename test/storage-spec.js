const _ = require('lodash');
const async = require('async');
const chai = require('chai');
const chance = require('chance')();
const chanceMixin = require('./support/chanceMixin');
const fs = require('fs');
const path = require('path');
const reflect = require('async/reflect');
const Storage = require('../lib/storagev2');
const url = require('url');
const uuid = require('uuid');

const expect = chai.expect;
chance.mixin(chanceMixin);

describe('storage', () => {
  const streamsDir = path.normalize(path.join(__dirname, '..', 'tmp', 'streams-dir'));
  const storage = new Storage(streamsDir);
  const db = storage.db;

  beforeEach((done) => {
    async.waterfall([
      reflect(async.apply(fs.stat, streamsDir)),
      (res, next) => {
        if (res.error) return next(res.error.code === 'ENOENT' ? null : res.error);
        return fs.rmdir(streamsDir, next);
      },
      async.apply(fs.mkdir, streamsDir),
    ], done);
  });

  describe('saveRequest', () => {
    let request;

    beforeEach(() => {
      request = chance.http.request();
    });

    it('should save request with headers', (done) => {
      const requestUrl = url.parse(request.url);
      const requestId = uuid.v4();
      async.waterfall([
        (next) => storage.saveRequest(requestId, request, next),
        (next) => db.findOne({ _id: requestId }, next),
        (data, next) => {
          const reqData = data.request;
          expect(reqData.host).to.eql(requestUrl.host);
          expect(reqData.method).to.eql(request.method);
          expect(reqData.path).to.eql(request.path);
          expect(reqData.httpVersion).to.eql(request.httpVersion);
          expect(reqData.headers).to.eql(_.map(_.chunk(request.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })));
          expect(data.date.getTime()).to.be.closeTo(new Date().getTime(), 100);
          next();
        },
      ], done);
    });

    xit('should save request body into streams dir', () => {
    });
  });

  describe('saveResponse', () => {
    let response;
    let requestId;
    beforeEach((done) => {
      requestId = uuid.v4();
      response = chance.http.response();
      storage.saveRequest(requestId, chance.http.request(), done);
    });

    it('should save response with headers and body', (done) => {
      async.waterfall([
        (next) => storage.saveResponse(requestId, response, next),
        (next) => db.findOne({ _id: requestId }, next),
        (data, next) => {
          const respData = data.response;
          expect(respData.statusCode).to.eql(response.statusCode);
          expect(respData.statusMessage).to.eql(response.statusMessage);
          expect(respData.httpVersion).to.eql(response.httpVersion);
          expect(respData.headers).to.eql(_.map(_.chunk(response.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })));
          next();
        },
      ], done);
    });

    it('should not clear request data', (done) => {
      async.waterfall([
        (next) => storage.saveResponse(requestId, response, next),
        (next) => db.findOne({ _id: requestId }, next),
        (data, next) => {
          expect(data.request).not.to.be.an('undefined');
          next();
        },
      ], done);
    });

    it('should fail to save not for not existing request', (done) => {
      requestId = uuid.v4();
      async.waterfall([
        async.reflect(next => storage.saveResponse(requestId, response, next)),
        (res, next) => {
          expect(res.error).to.be.an.instanceOf(Error);
          next();
        },
      ], done);
    });

    xit('should save response body into streams dir', () => {
    });
  });
});
