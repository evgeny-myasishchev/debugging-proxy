const _ = require('lodash');
const chance = require('chance')();
const fs = require('fs');
const path = require('path');
const url = require('url');
const uuid = require('uuid');

chance.mixin({
  data: {
    request: () => {
      const requestUrl = url.parse(`${chance.url()}?key1=${chance.word()}&key2=${chance.word()}`);
      return {
        protocol: chance.http.protocol(),
        host: requestUrl.host,
        method: chance.http.method(),
        path: requestUrl.path,
        httpVersion: chance.http.httpVersion(),
        headers: [
          { key: 'Host', value: requestUrl.host },
          { key: 'X-Header-1', value: `header-1-${chance.word()}` },
          { key: 'X-Header-2', value: `header-2-${chance.word()}` },
          { key: 'X-Header-3', value: `header-3-${chance.word()}` },
        ],
        meta: {
          url: requestUrl,
        },
      };
    },
    response: () => ({
      httpVersion: chance.http.httpVersion(),
      statusCode: chance.integer({ min: 100, max: 599 }),
      statusMessage: chance.sentence({ words: 3 }),
      headers: [
        { key: 'X-Header-1', value: `header-1-${chance.word()}` },
        { key: 'X-Header-2', value: `header-2-${chance.word()}` },
        { key: 'X-Header-3', value: `header-3-${chance.word()}` },
      ],
    }),
    savedRequest: () => ({
      _id: uuid.v4(),
      date: chance.date(),
      request: chance.data.request(),
      response: chance.data.response(),
    }),
  },
  http: {
    protocol: () => chance.pick(['https', 'http']),
    method: () => chance.pick(['GET', 'POST', 'PUT', 'DELETE']),
    httpVersion: () => chance.pick(['1.0', '1.1', '2.0']),
    prepareBodyStream: (requestId, tmpDir, prefix = '') => {
      const reqBodyFile = path.join(tmpDir, `${prefix}input-body-${requestId}.txt`);
      let reqBody;
      fs.writeFileSync(reqBodyFile, reqBody = chance.sentence());
      return {
        stream: fs.createReadStream(reqBodyFile),
        path: reqBodyFile,
        data: reqBody,
      };
    },
    saveRequestParams: (tmpDir) => {
      const request = chance.http.requestWithBody(tmpDir);
      return {
        requestId: request.meta.id,
        request,
        host: request.meta.url.host,
        protocol: _.trimEnd(request.meta.url.protocol, ':'),
      };
    },
    requestWithBody: (tmpDir) => {
      const requestId = uuid.v4();
      const body = chance.http.prepareBodyStream(requestId, tmpDir, 'request-');
      return _.merge(chance.http.request(body.stream), {
        meta: {
          id: requestId,
          body,
        },
      });
    },
    request: (bodyStream) => {
      const requestUrl = url.parse(`${chance.url()}?key1=${chance.word()}&key2=${chance.word()}`);
      return _.merge(bodyStream, {
        method: chance.http.method(),
        url: requestUrl.path,
        httpVersion: chance.http.httpVersion(),
        rawHeaders: [
          'Host', requestUrl.host,
          'X-Header-1', `header-1-${chance.word()}`,
          'X-Header-2', `header-2-${chance.word()}`,
          'X-Header-3', `header-3-${chance.word()}`,
        ],
        meta: {
          url: requestUrl,
        },
      });
    },
    responseWithBody: (requestId, tmpDir) => {
      const body = chance.http.prepareBodyStream(requestId, tmpDir, 'resonse-');
      const response = chance.http.response(body.stream);
      response.meta = {
        body,
      };
      return response;
    },
    response: (bodyStream) => (
      _.merge(bodyStream, {
        httpVersion: chance.http.httpVersion(),
        statusCode: chance.integer({ min: 100, max: 599 }),
        statusMessage: chance.sentence({ words: 3 }),
        rawHeaders: [
          'X-Header-1', `header-1-${chance.word()}`,
          'X-Header-2', `header-2-${chance.word()}`,
          'X-Header-3', `header-3-${chance.word()}`,
        ],
      })
    ),
  },
});

module.exports = chance;
