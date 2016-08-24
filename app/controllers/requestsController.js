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
