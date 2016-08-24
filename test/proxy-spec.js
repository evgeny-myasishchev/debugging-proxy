const _ = require('lodash');
const async = require('async');
const chai = require('chai');
const chance = require('chance')();
const config = require('config');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const proxy = require('../app/proxy');
const request = require('request');
const Storage = require('../app/models/Storage');
const streams = require('./support/streams');
const tmpHelper = require('./support/tmpHelper');
const logging = require('./support/logging');

const expect = chai.expect;

describe('proxy', () => {
  logging.hook(this);

  const tmpDir = path.normalize(path.join(__dirname, '..', 'tmp', 'proxy-spec'));
  const streamsDir = path.normalize(path.join(tmpDir, 'streams-dir'));
  const storage = new Storage({
    inMemoryOnly: true,
    streamsDir,
  });

  let proxyServer;
  let fakePostData;
  let fakeRespBody;
  let fakeRespHeader;
  let fakeReqHeader;
  let r;
  let server;
  const port = chance.integer({ min: 45001, max: 50000 });

  tmpHelper.maintain(tmpDir);

  beforeEach((done) => {
    fakePostData = chance.sentence();
    fakeReqHeader = chance.word();
    r = request.defaults({
      headers: { 'X-Custom-Req-Header': fakeReqHeader },
      proxy: `http://localhost:${config.port}`,
      rejectUnauthorized: false,
    });
    async.waterfall([
      async.apply(fs.mkdir, streamsDir),
      (next) => proxy.startServer(storage, _.pick(config, ['port', 'httpsPort', 'verifyHttpsCertificate', 'ssl']), (err, srv) => {
        proxyServer = srv;
        return next(err);
      }),
    ], done);
  });

  afterEach((done) => {
    async.parallel([
      (next) => storage.db.remove({}, next),
      (next) => {
        if (proxyServer) proxyServer.close(next);
        else next();
      },
    ], done);
  });

  const commonProcessRequest = (req, res) =>
    streams.toBuffer(req, (err, buffer) => {
      try {
        if (err) throw err;
        expect(req.headers['x-custom-req-header'], 'received unexpected headers').to.eql(fakeReqHeader);
        expect(buffer.toString(), 'received unexpected post body').to.eql(fakePostData);
      } catch (e) {
        _.set(res, 'statusCode', 400);
        _.set(res, 'statusMessage', 'assertion failed');
        return res.end(e.message);
      }

      res.setHeader('X-Custom-Res-Header', fakeRespHeader = chance.word());
      return res.end(fakeRespBody = chance.sentence());
    });

  const assertCommon = (res, body, cb) => {
    expect(res.statusCode, body).to.eql(200);
    expect(res.headers['x-custom-res-header']).to.eql(fakeRespHeader);
    expect(body).to.eql(fakeRespBody);

    async.waterfall([
      (next) => storage.getRequests(next),
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
    ], cb);
  };

  describe('http', () => {
    beforeEach((done) => {
      server = http.createServer().listen(port, done);
    });

    afterEach((done) => {
      server.close(done);
      server = null;
    });

    it('should save http request/response', (done) => {
      server.on('request', commonProcessRequest);
      async.waterfall([
        async.apply(r.post, `http://localhost:${port}`, {
          body: fakePostData,
        }),
        assertCommon,
      ], done);
    });

    it('should handle nested paths', (done) => {
      server.on('request', (req, res) => res.end(JSON.stringify({ url: req.url })));
      async.waterfall([
        async.apply(r.get, `http://localhost:${port}/v1/nested-path`),
        (res, body, next) => {
          const data = JSON.parse(body);
          expect(data.url).to.eql('/v1/nested-path');
          return next();
        },
      ], done);
    });
  });

  describe('https', () => {
    const httpsCfg = {
      key: fs.readFileSync(config.ssl.key),
      cert: fs.readFileSync(config.ssl.cert),
    };

    beforeEach((done) => {
      server = https.createServer(httpsCfg).listen(port, done);
    });

    afterEach((done) => {
      server.close(done);
      server = null;
    });

    it('should save http request/response', (done) => {
      server.on('request', commonProcessRequest);
      async.waterfall([
        async.apply(r.post, `https://localhost:${port}`, {
          body: fakePostData,
        }),
        assertCommon,
      ], done);
    });

    it('should handle nested paths', (done) => {
      server.on('request', (req, res) => res.end(JSON.stringify({ url: req.url })));
      async.waterfall([
        async.apply(r.get, `https://localhost:${port}/v1/nested-path`),
        (res, body, next) => {
          const data = JSON.parse(body);
          expect(data.url).to.eql('/v1/nested-path');
          return next();
        },
      ], done);
    });
  });
});
