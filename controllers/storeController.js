const mongoose = require('mongoose'); 
const multer = require('multer');
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

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  console.log(stores);
  res.render('stores', {
    title: 'Stores',
    stores,
  });
}

exports.editStore = async (req, res) => {
  // This is called when we pass store id as a route param.
  // The template rendered is the same as for addStore() controller,
  // but here we have data (store by id) which affects the title of the page
  // and lets populate fields in storeForm mixin.
  const store = await Store.findOne({ _id: req.params.id });
  res.render('editStore', {
    title: `Edit ${store.name}`,
    store
  });
}

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';
  const store = await Store.findOneAndUpdate({
      _id: req.params.id
    },
    req.body,
    { 
      new: true, // return the new store instead of old one
      runValidators: true
    }).exec();
  req.flash('success', `Successfully updated ${store.name}. <a href="/stores/${store.slug}">View store</a>`);
  res.redirect(`/stores/${store._id}/edit`); 
}