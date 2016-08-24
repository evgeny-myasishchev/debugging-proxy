const async = require('async');
const reflect = require('async/reflect');
const rimraf = require('rimraf');
const fs = require('fs');

module.exports = {
  maintain: (tmpDir) =>
    beforeEach((done) => {
      async.waterfall([
        reflect(async.apply(fs.stat, tmpDir)),
        (res, next) => {
          if (res.error) return next(res.error.code === 'ENOENT' ? null : res.error);
          return rimraf(tmpDir, next);
        },
        async.apply(fs.mkdir, tmpDir),
      ], done);
    }),
};
