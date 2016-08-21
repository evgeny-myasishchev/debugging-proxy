const _ = require('lodash');
const async = require('async');
const chai = require('chai');
const chance = require('chance')();
const config = require('config');
const fs = require('fs');
const http = require('http');
const path = require('path');
const proxy = require('../lib/proxyv2');
const reflect = require('async/reflect');
const request = require('request');
const rimraf = require('rimraf');
const Storage = require('../lib/Storage');
const streams = require('./support/streams');

const expect = chai.expect;

describe('proxy', () => {
  const tmpDir = path.normalize(path.join(__dirname, '..', 'tmp', 'proxy-spec'));
  const streamsDir = path.normalize(path.join(tmpDir, 'streams-dir'));
  const storage = new Storage({
    inMemoryOnly: true,
    streamsDir,
  });

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

  afterEach((done) => {
    storage.db.remove({}, done);
  });


  describe('http', () => {
    let server;
    const port = 45001;
    let fakeRespBody;
    let fakeRespHeader;
    const r = request.defaults({ proxy: `http://localhost:${config.port}` });
    beforeEach((done) => {
      server = http.createServer((req, res) => {
        res.setHeader('X-Custom-Res-Header', fakeRespHeader = chance.word());
        res.end(fakeRespBody = chance.sentence());
      });
      async.parallel([
        (next) => server.listen(port, next),
        (next) => proxy.listen(storage, _.pick(config, ['port', 'ssl']), next),
      ], done);
    });

    afterEach((done) => {
      async.parallel([
        (next) => server.close(next),
        (next) => proxy.close(next),
      ], done);
    });

    it('should save http request/response', (done) => {
      const fakePostData = chance.sentence();
      const fakeReqHeader = chance.word();
      async.waterfall([
        async.apply(r.post, `http://localhost:${port}`, {
          headers: {
            'X-Custom-Req-Header': fakeReqHeader,
          },
          body: fakePostData,
        }),
        (res, body, next) => {
          expect(res.headers['x-custom-res-header']).to.eql(fakeRespHeader);
          expect(body).to.eql(fakeRespBody);
          storage.getRequests(next);
        },
        (requests, next) => {
          expect(requests.length).to.eql(1);
          const req = requests[0];
          expect(_.find(req.request.headers, { key: 'X-Custom-Req-Header' }).value).to.eql(fakeReqHeader);
          expect(_.find(req.response.headers, { key: 'X-Custom-Res-Header' }).value).to.eql(fakeRespHeader);
          const reqId = _.get(req, '_id');

          // Making sure req/res body is saved
          async.waterfall([
            (next1) => streams.toBuffer(storage.createRequestBodyStream(reqId), next1),
            (reqData, next1) => {
              expect(reqData.toString()).to.eql(fakePostData);
              next1();
            },
            (next1) => streams.toBuffer(storage.createResponseBodyStream(reqId), next1),
            (respData, next1) => {
              expect(respData.toString()).to.eql(fakeRespBody);
              next1();
            },
          ], next);
        },
      ], done);
    });
  });
});
