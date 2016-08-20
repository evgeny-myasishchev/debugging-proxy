const chance = require('chance')();
const url = require('url');

module.exports = {
  http: {
    method: () => chance.pick(['GET', 'POST', 'PUT', 'DELETE']),
    request: () => {
      const requestUrl = url.parse(chance.url());
      return {
        method: chance.http.method(),
        url: requestUrl.href,
        httpVersion: '1.1',
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
