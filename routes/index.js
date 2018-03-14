const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController')

// Do work here
router.get('/', storeController.customMiddleware, storeController.homePage);

router.get('/reverse/:name', function(req, res) {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
});

module.exports = router;
