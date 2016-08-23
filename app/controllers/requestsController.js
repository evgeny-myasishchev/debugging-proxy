const express = require('express');

function create() {
  const router = new express.Router();

  router.get('/api/v1/requests', (req, res) => {
    res.send('hello world');
  });

  return router;
}

module.exports = {
  create,
};
