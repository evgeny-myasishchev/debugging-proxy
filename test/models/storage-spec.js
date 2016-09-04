const _ = require('lodash');
const async = require('async');
const chai = require('chai');
const chance = require('../support/chance');
const fs = require('fs');
const path = require('path');
const Storage = require('../../app/models/Storage');
const streams = require('../support/streams');
const url = require('url');
const uuid = require('uuid');
const tmpHelper = require('../support/tmpHelper');
const logging = require('../support/logging');

const expect = chai.expect;

describe('storage', () => {
  logging.hook();
  const tmpDir = path.normalize(path.join(__dirname, '..', '..', 'tmp', 'storage-spec'));
  const streamsDir = path.normalize(path.join(tmpDir, 'streams-dir'));
  const storage = new Storage({
    inMemoryOnly: true,
    streamsDir: path.join('tmp', 'storage-spec', 'streams-dir'),
  });
  const db = storage.db;

  tmpHelper.maintain(tmpDir);

  beforeEach(() => {
    fs.mkdirSync(streamsDir);
  });

  afterEach((done) => {
    storage.removeAllListeners();
    db.remove({}, done);
  });

  describe('getRequests', () => {
    it('should get all saved requests', (done) => {
      const req1 = chance.http.saveRequestParams(tmpDir);
      const req2 = chance.http.saveRequestParams(tmpDir);
      async.waterfall([
        async.apply(async.parallel, [
          (next) => storage.saveRequest(req1, next),
          (next) => storage.saveRequest(req2, next),
        ]),
        (res, next) => storage.getRequests(next),
        (requests, next) => {
          expect(requests.length).to.eql(2);
          const actualReq1 = _.find(requests, _.matches({ _id: req1.requestId }));
          expect(actualReq1.request.path).to.eql(req1.request.meta.url.path);
          const actualReq2 = _.find(requests, _.matches({ _id: req2.requestId }));
          expect(actualReq2.request.path).to.eql(req2.request.meta.url.path);
          next();
        },
      ], done);
    });

    it('should include response', (done) => {
      const request = chance.http.saveRequestParams(tmpDir);
      const response = chance.http.responseWithBody(request.requestId, tmpDir);
      async.waterfall([
        async.apply(async.waterfall, [
          (next) => storage.saveRequest(request, next),
          (next) => storage.saveResponse(request.requestId, response, next),
        ]),
        (next) => storage.getRequests(next),
        (requests, next) => {
          const req = _.find(requests, _.matches({ _id: request.requestId }));
          expect(req.request.path).to.eql(request.request.meta.url.path);
          expect(req.response.statusCode).to.eql(response.statusCode);
          expect(req.response.statusMessage).to.eql(response.statusMessage);
          next();
        },
      ], done);
    });
  });

  describe('createRequestBodyStream', () => {
    it('should create read stream for given requestId', (done) => {
      const req1 = chance.http.saveRequestParams(tmpDir);
      const req2 = chance.http.saveRequestParams(tmpDir);
      async.waterfall([
        async.apply(async.parallel, [
          (next) => storage.saveRequest(req1, next),
          (next) => storage.saveRequest(req2, next),
        ]),
        (res, next) => streams.toBuffer(storage.createRequestBodyStream(req1.requestId), next),
        (buffer, next) => {
          expect(buffer.toString()).to.eql(req1.request.meta.body.data);
          streams.toBuffer(storage.createRequestBodyStream(req2.requestId), next);
        },
        (buffer, next) => {
          expect(buffer.toString()).to.eql(req2.request.meta.body.data);
          next();
        },
      ], done);
    });
  });

  describe('createResponseBodyStream', () => {
    it('should create read stream for given requestId', (done) => {
      const req1 = chance.http.saveRequestParams(tmpDir);
      const res1 = chance.http.responseWithBody(req1.requestId, tmpDir);
      const req2 = chance.http.saveRequestParams(tmpDir);
      const res2 = chance.http.responseWithBody(req2.requestId, tmpDir);
      async.waterfall([
        async.apply(async.waterfall, [
          (next) => storage.saveRequest(req1, next),
          (next) => storage.saveResponse(req1.requestId, res1, next),
          (next) => storage.saveRequest(req2, next),
          (next) => storage.saveResponse(req2.requestId, res2, next),
        ]),
        (next) => streams.toBuffer(storage.createResponseBodyStream(req1.requestId), next),
        (buffer, next) => {
          expect(buffer.toString()).to.eql(res1.meta.body.data);
          streams.toBuffer(storage.createResponseBodyStream(req2.requestId), next);
        },
        (buffer, next) => {
          expect(buffer.toString()).to.eql(res2.meta.body.data);
          next();
        },
      ], done);
    });
  });

  describe('purge', () => {
    it('should remove all the data and streams', (done) => {
      const req1 = chance.http.saveRequestParams(tmpDir);
      const res1 = chance.http.responseWithBody(req1.requestId, tmpDir);
      const req2 = chance.http.saveRequestParams(tmpDir);
      const res2 = chance.http.responseWithBody(req2.requestId, tmpDir);
      async.waterfall([
        async.apply(async.waterfall, [
          (next) => storage.saveRequest(req1, next),
          (next) => storage.saveResponse(req1.requestId, res1, next),
          (next) => storage.saveRequest(req2, next),
          (next) => storage.saveResponse(req2.requestId, res2, next),
        ]),
        (next) => storage.purge(next),
        (next) => storage.getRequests(next),
        (requests, next) => {
          expect(requests.length, 'Requests has not been removed').to.eql(0);
          fs.readdir(streamsDir, next);
        },
        (files, next) => {
          expect(files.length, 'Streams has not been removed').to.eql(0);
          next();
        },
      ], done);
    });
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
      const protocol = chance.http.protocol();
      const host = chance.domain();
      const requestUrl = url.parse(request.url);
      async.waterfall([
        (next) => storage.saveRequest({ requestId, request, host, protocol }, next),
        (next) => db.findOne({ _id: requestId }, next),
        (data, next) => {
          const reqData = data.request;
          expect(reqData.protocol).to.eql(protocol);
          expect(reqData.host).to.eql(host);
          expect(reqData.method).to.eql(request.method);
          expect(reqData.path).to.eql(requestUrl.path);
          expect(reqData.httpVersion).to.eql(request.httpVersion);
          expect(reqData.headers).to.eql(_.map(_.chunk(request.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })));
          expect(data.startedAt.getTime()).to.be.closeTo(new Date().getTime(), 100);
          next();
        },
      ], done);
    });

    it('should save request body into streams dir', (done) => {
      async.waterfall([
        (next) => storage.saveRequest({ requestId, request, host: chance.domain(), protocol: chance.http.protocol() }, next),
        (next) => {
          const reqFile = path.join(streamsDir, `${requestId}-req.txt`);
          expect(fs.existsSync(reqFile), `Req body has not been saved to ${reqFile}`).to.eql(true);
          expect(fs.readFileSync(reqFile).toString()).to.eql(fakeBody.data);
          next();
        },
      ], done);
    });

    it('should raise request-saved event', (done) => {
      const protocol = chance.http.protocol();
      const host = chance.domain();
      const requestUrl = url.parse(request.url);
      async.waterfall([
        (next) => {
          storage.on('request-saved', async.apply(next, null));
          storage.saveRequest({ requestId, request, host, protocol }, _.noop);
        },
        (data, next) => {
          const reqData = data.request;
          expect(_.get(data, '_id')).to.eql(requestId);
          expect(reqData.protocol).to.eql(protocol);
          expect(reqData.host).to.eql(host);
          expect(reqData.method).to.eql(request.method);
          expect(reqData.path).to.eql(requestUrl.path);
          expect(reqData.httpVersion).to.eql(request.httpVersion);
          expect(reqData.headers).to.eql(_.map(_.chunk(request.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })));
          expect(data.startedAt.getTime()).to.be.closeTo(new Date().getTime(), 100);
          next();
        },
      ], done);
    });
  });

  describe('saveResponse', () => {
    let response;
    let requestId;
    let fakeResBody;
    beforeEach((done) => {
      requestId = uuid.v4();
      fakeResBody = chance.http.prepareBodyStream(requestId, tmpDir, 'response-');
      const fakeReqBody = chance.http.prepareBodyStream(requestId, tmpDir, 'request-');
      response = chance.http.response(fakeResBody.stream);
      storage.saveRequest({ requestId, request: chance.http.request(fakeReqBody.stream) }, done);
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
          expect(data.completedAt.getTime()).to.be.closeTo(new Date().getTime(), 100);
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

    it('should save response body into streams dir', (done) => {
      async.waterfall([
        (next) => storage.saveResponse(requestId, response, next),
        (next) => {
          const resFile = path.join(streamsDir, `${requestId}-res.txt`);
          expect(fs.existsSync(resFile), `Res body has not been saved to ${resFile}`).to.eql(true);
          expect(fs.readFileSync(resFile).toString()).to.eql(fakeResBody.data);
          next();
        },
      ], done);
    });

    it('should raise response-saved event', (done) => {
      async.waterfall([
        (next) => {
          storage.on('response-saved', async.apply(next, null));
          storage.saveResponse(requestId, response, _.noop);
        },
        (data, next) => {
          const respData = data.response;
          expect(_.get(data, '_id')).to.eql(requestId);
          expect(respData.statusCode).to.eql(response.statusCode);
          expect(respData.statusMessage).to.eql(response.statusMessage);
          expect(respData.httpVersion).to.eql(response.httpVersion);
          expect(respData.headers).to.eql(_.map(_.chunk(response.rawHeaders, 2), (pair) => ({ key: pair[0], value: pair[1] })));
          expect(data.completedAt.getTime()).to.be.closeTo(new Date().getTime(), 100);
          next();
        },
      ], done);
    });
  });
});
