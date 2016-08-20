const async = require('async');
const reflect = require('async/reflect');
const fs = require('fs');
const path = require('path');
const memdown = require('memdown');
const Storage = require('../lib/storagev2');
const levelup = require('levelup');
const chance = require('chance')();
const chanceMixin = require('./support/chanceMixin');

chance.mixin(chanceMixin);

describe('storage', () => {
  const db = levelup({ db: memdown });
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
    it('should save request with headers and body', () => {
      console.log(chance.http.request());
    });
  });

  xdescribe('saveResponse', () => {
    it('should save response with headers and body', () => {

    });
  });
});
