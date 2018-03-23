const mongoose = require('mongoose'); 
const Store = mongoose.model('Store');

exports.customMiddleware = (req, res, next) => {
  req.name = 'Natalya';
  if (req.query.error === 'true') {
    throw Error('error occurred');
  }
  res.cookie('test', 'some content', {maxAge: 1000000});
  next();
}

exports.homePage = (req, res) => {
  console.log('Hello,', req.name);
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('addStore', { title: 'Add Store'});
}

exports.createStore = async (req, res) => {
  // res.json(req.body);
  const store = new Store(req, body);
  store.age = 10;
  await store.save();
  res.redirect('/');
}