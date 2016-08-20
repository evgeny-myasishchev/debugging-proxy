const chance = require('chance')();
const url = require('url');

module.exports = {
  http: {
    method: () => chance.pick(['GET', 'POST', 'PUT', 'DELETE']),
    request: () => {
      const requestUrl = url.parse(`${chance.url()}?key1=${chance.word()}&key2=${chance.word()}`);
      return {
        method: chance.http.method(),
        url: requestUrl.href,
        httpVersion: chance.pick(['1.0', '1.1', '2.0']),
        rawHeaders: [
          'Host', requestUrl.host,
          'X-Header-1', `header-1-${chance.word()}`,
          'X-Header-2', `header-2-${chance.word()}`,
          'X-Header-3', `header-3-${chance.word()}`,
        ],
      };
    },

  },
};
