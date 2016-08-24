const express = require('express');

function create(storage) {
  const router = new express.Router();

  router.get('/api/v1/requests', (req, res) => {
    storage.getRequests((err, requests) => {
      if (err) {
        req.log.error(err, 'Failed to get requests');
        return res.sendStatus(500);
      }
      return res.json(requests);
    });
  });

  router.get('/api/v1/requests/:requestId', (req, res) => {
    // TODO: Return 404 if no such request. Include content type.
    const stream = storage.createRequestBodyStream(req.params.requestId);
    stream.pipe(res);
  });

  router.get('/api/v1/requests/:requestId/response', (req, res) => {
    // TODO: Return 404 if no such request. Include content type.
    const stream = storage.createResponseBodyStream(req.params.requestId);
    stream.pipe(res);
  });

  router.delete('/api/v1/requests', (req, res) => {
    storage.purge((err) => {
      if (err) {
        req.log.error(err, 'Failed to purge storage');
        return res.sendStatus(500);
      }
      req.log.debug('Storage purged');
      return res.sendStatus(200);
    });
  });

  return router;
}

module.exports = {
  create,
};
