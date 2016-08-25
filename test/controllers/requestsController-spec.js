const _ = require('lodash');
const app = require('../../app');
const async = require('async');
const chai = require('chai');
const chance = require('chance')();
const chanceMixin = require('../support/chanceMixin');
const fs = require('fs');
const logging = require('../support/logging');
const path = require('path');
const request = require('supertest');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const Storage = require('../../app/models/Storage');
const tmpHelper = require('../support/tmpHelper');

const expect = chai.expect;
chance.mixin(chanceMixin);
chai.use(sinonChai);

describe('requestsController', () => {
  const tmpDir = path.normalize(path.join(__dirname, '..', '..', 'tmp', 'storage-spec'));
  const streamsDir = path.normalize(path.join(tmpDir, 'streams-dir'));
  const storage = new Storage({
    inMemoryOnly: true,
    streamsDir: path.join('tmp', 'storage-spec', 'streams-dir'),
  });
  const db = storage.db;

  tmpHelper.maintain(tmpDir);
  logging.hook(this);

  let server;
  const sandbox = sinon.sandbox.create();
  beforeEach((done) => {
    fs.mkdirSync(streamsDir);
    app.startApiLayer(storage, (err, srv) => {
      server = srv;
      done(err);
    });
  });

  afterEach((done) => {
    sandbox.restore();
    async.series([
      (next) => db.remove({}, next),
      (next) => server.close(next),
    ], done);
  });

  describe('GET /api/v1/requests', () => {
    it('should get all requests from storage and return them', (done) => {
      sandbox.spy(storage, 'getRequests');
      const req1 = chance.http.saveRequestParams(tmpDir);
      const req2 = chance.http.saveRequestParams(tmpDir);
      const req3 = chance.http.saveRequestParams(tmpDir);
      async.waterfall([
        async.apply(async.each, [req1, req2, req3], (req, next) => storage.saveRequest(req, next)),
        (next) => request(server)
          .get('/api/v1/requests')
          .expect(200)
          .expect((res) => {
            expect(res.body.length).to.eql(3);
            expect(_.find(res.body, { _id: req1.requestId })).not.to.be.an('undefined');
            expect(_.find(res.body, { _id: req2.requestId })).not.to.be.an('undefined');
            expect(_.find(res.body, { _id: req3.requestId })).not.to.be.an('undefined');
            expect(storage.getRequests).to.have.callCount(1);
          })
          .end(next),
      ], done);
    });

    it('should respond with 500 if storage raises error', (done) => {
      sandbox.stub(storage, 'getRequests', (cb) => cb(new Error('Failed to get reqeusts')));
      request(server)
        .get('/api/v1/requests')
        .expect(500)
        .end(done);
    });
  });

  describe('DELETE /api/v1/requests', () => {
    it('should purge storage', (done) => {
      sandbox.spy(storage, 'purge');
      const req1 = chance.http.saveRequestParams(tmpDir);
      const req2 = chance.http.saveRequestParams(tmpDir);
      const req3 = chance.http.saveRequestParams(tmpDir);
      async.waterfall([
        async.apply(async.each, [req1, req2, req3], (req, next) => storage.saveRequest(req, next)),
        (next) => request(server)
          .delete('/api/v1/requests')
          .expect(200)
          .expect(() => {
            expect(storage.purge).to.have.callCount(1);
          })
          .end(next),
      ], done);
    });

    it('should respond with 500 if purge fails', (done) => {
      sandbox.stub(storage, 'purge', (cb) => cb(new Error('Failed to get reqeusts')));
      request(server)
        .delete('/api/v1/requests')
        .expect(500)
        .end(done);
    });
  });

  describe('GET /api/v1/requests/:requestId', () => {
    it('should send request body', (done) => {
      const req1 = chance.http.saveRequestParams(tmpDir);
      const req2 = chance.http.saveRequestParams(tmpDir);
      async.waterfall([
        async.apply(async.each, [req1, req2], (req, next) => storage.saveRequest(req, next)),
        (next) => request(server)
          .get(`/api/v1/requests/${req1.requestId}`)
          .expect(200)
          .expect((res) => {
            expect(res.text).to.eql(req1.request.meta.body.data);
          })
          .end(next),
      ], done);
    });
  });

  describe('GET /api/v1/requests/:requestId/response', () => {
    it('should send request body', (done) => {
      const req1 = chance.http.saveRequestParams(tmpDir);
      const req2 = chance.http.saveRequestParams(tmpDir);
      const res1 = chance.http.responseWithBody(req1.requestId, tmpDir);
      const res2 = chance.http.responseWithBody(req2.requestId, tmpDir);
      async.waterfall([
        async.apply(async.each, [req1, req2], (req, next) => storage.saveRequest(req, next)),
        (next) => storage.saveResponse(req1.requestId, res1, next),
        (next) => storage.saveResponse(req2.requestId, res2, next),
        (next) => request(server)
          .get(`/api/v1/requests/${req1.requestId}/response`)
          .expect(200)
          .expect((res) => {
            expect(res.text).to.eql(res1.meta.body.data);
          })
          .end(next),
      ], done);
    });
  });
});
