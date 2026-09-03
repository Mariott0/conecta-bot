const express = require('express');

const router = express.Router();

router.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    service: 'conecta-ofertas',
  });
});

module.exports = router;
