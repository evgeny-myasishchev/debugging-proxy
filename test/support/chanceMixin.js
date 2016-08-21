const _ = require('lodash');
const chance = require('chance')();
const fs = require('fs');
const path = require('path');
const url = require('url');

module.exports = {
  http: {
    method: () => chance.pick(['GET', 'POST', 'PUT', 'DELETE']),
    httpVersion: () => chance.pick(['1.0', '1.1', '2.0']),
    prepareBodyStream: (requestId, tmpDir) => {
      const reqBodyFile = path.join(tmpDir, `input-body-${requestId}.txt`);
      let reqBody;
      fs.writeFileSync(reqBodyFile, reqBody = chance.sentence());
      return {
        stream: fs.createReadStream(reqBodyFile),
        path: reqBodyFile,
        data: reqBody,
      };
    },
    request: (bodyStream) => {
      const requestUrl = url.parse(`${chance.url()}?key1=${chance.word()}&key2=${chance.word()}`);
      return _.merge(bodyStream, {
        method: chance.http.method(),
        url: requestUrl.href,
        httpVersion: chance.http.httpVersion(),
        rawHeaders: [
          'Host', requestUrl.host,
          'X-Header-1', `header-1-${chance.word()}`,
          'X-Header-2', `header-2-${chance.word()}`,
          'X-Header-3', `header-3-${chance.word()}`,
        ],
      });
    },
    response: () => (
      {
        httpVersion: chance.http.httpVersion(),
        statusCode: chance.integer({ min: 100, max: 599 }),
        statusMessage: chance.sentence({ words: 3 }),
        rawHeaders: [
          'X-Header-1', `header-1-${chance.word()}`,
          'X-Header-2', `header-2-${chance.word()}`,
          'X-Header-3', `header-3-${chance.word()}`,
        ],
      }
    ),
  },
};
