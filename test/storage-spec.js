const _ = require('lodash');
const async = require('async');
const chai = require('chai');
const chance = require('chance')();
const chanceMixin = require('./support/chanceMixin');
const fs = require('fs');
const path = require('path');
const reflect = require('async/reflect');
const rimraf = require('rimraf');
const Storage = require('../lib/storagev2');
const url = require('url');
const uuid = require('uuid');

const expect = chai.expect;
chance.mixin(chanceMixin);

describe('storage', () => {
  const tmpDir = path.normalize(path.join(__dirname, '..', 'tmp', 'storage-spec'));
  const streamsDir = path.normalize(path.join(tmpDir, 'streams-dir'));
  const storage = new Storage(streamsDir);
  const db = storage.db;

  beforeEach((done) => {
    async.waterfall([
      reflect(async.apply(fs.stat, tmpDir)),
      (res, next) => {
        if (res.error) return next(res.error.code === 'ENOENT' ? null : res.error);
        return rimraf(tmpDir, next);
      },
      async.apply(fs.mkdir, tmpDir),
      async.apply(fs.mkdir, streamsDir),
    ], done);
  });

  describe('saveRequest', () => {
    let request;
    let fakeBody;
    let requestId;

    beforeEach(() => {
      requestId = uuid.v4();
      fakeBody = chance.http.prepareBodyStream(requestId, tmpDir);
      request = chance.http.request(fakeBody.stream);
    });

    it('should save request with headers', (done) => {
      const requestUrl = url.parse(request.url);
      async.waterfall([
        (next) => storage.saveRequest(requestId, request, next),
        (next) => db.findOne({ _id: requestId }, next),
        (data, next) => {
          const reqData = data.request;
          expect(reqData.host).to.eql(requestUrl.host);
          expect(reqData.method).to.eql(request.method);
          expect(reqData.path).to.eql(requestUrl.path);
          expect(reqData.httpVersion).to.eql(request.httpVersion);
          expect(reqData.headers).to.eql(_.map(_.chunk(request.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })));
          expect(data.date.getTime()).to.be.closeTo(new Date().getTime(), 100);
          next();
        },
      ], done);
    });

    it('should save request body into streams dir', (done) => {
      async.waterfall([
        (next) => storage.saveRequest(requestId, request, next),
        (next) => {
          const reqFile = path.join(streamsDir, `${requestId}-req.txt`);
          expect(fs.existsSync(reqFile), `Req body has not been saved to ${reqFile}`).to.eql(true);
          expect(fs.readFileSync(reqFile).toString()).to.eql(fakeBody.data);
          next();
        },
      ], done);
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
