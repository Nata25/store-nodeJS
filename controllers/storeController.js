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
  console.log('Home page is visited');
  res.render('index', {
    title: 'Home page'
  });
}

exports.addStore = (req, res) => {
  res.render('editStore', { 
    title: 'Add a new store'
  });
}

exports.createStore = async (req, res) => {
  // res.json(req.body);
  const store = new Store(req.body);
  await store.save();
  console.log('Store saved!')
  req.flash('success', `Successfully created ${store.name}! Care to leave a review?`)
 res.redirect(`/store/${store.slug}`);
}