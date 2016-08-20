const _ = require('lodash');
const async = require('async');
const chai = require('chai');
const chance = require('chance')();
const chanceMixin = require('./support/chanceMixin');
const fs = require('fs');
const levelup = require('levelup');
const memdown = require('memdown');
const path = require('path');
const reflect = require('async/reflect');
const sinon = require('sinon');
const Storage = require('../lib/storagev2');
const url = require('url');
const uuid = require('uuid');

const expect = chai.expect;
chance.mixin(chanceMixin);

describe('storage', () => {
  const db = levelup(_.merge({ db: memdown }, Storage.DB_OPTIONS));
  const streamsDir = path.normalize(path.join(__dirname, '..', 'tmp', 'streams-dir'));
  const storage = new Storage(db, streamsDir);

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
      this.clock = sinon.useFakeTimers();
    });
    afterEach(() => {
      this.clock.restore();
    });
    it('should save request with headers', (done) => {
      const requestUrl = url.parse(request.url);
      const requestId = uuid.v4();
      async.waterfall([
        (next) => storage.saveRequest(requestId, request, next),
        (next) => db.get(requestId, next),
        (data, next) => {
          expect(data.host).to.eql(requestUrl.host);
          expect(data.method).to.eql(request.method);
          expect(data.path).to.eql(request.path);
          expect(data.httpVersion).to.eql(request.httpVersion);
          expect(data.headers).to.eql(_.map(_.chunk(request.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })));
          expect(data.date).to.eql(new Date().toISOString());
          next();
        },
      ], done);
    });

    xit('should save request into streams dir', () => {
    });
  });

  xdescribe('saveResponse', () => {
    it('should save response with headers and body', () => {

    });
  });
});
