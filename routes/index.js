const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  const user = { name: 'Natalya', age: 35 };
  // res.send('Hey! It works!');
  // res.json(user);
  // res.json(req.query);
  res.render('hello', {
    name: req.query.name,
    age: 100,
  });
});

router.get('/reverse/:name', function(req, res) {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
});

module.exports = router;
