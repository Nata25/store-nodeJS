const mongoose = require('mongoose'); 
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: `This filetype isn't allowed`}, false);
    }
  }
}

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

exports.upload = multer(multerOptions).single('photo');
exports.resize = async (req, res, next) => {
  // check if file is present
  if (!req.file) {
    next(); // next middleware
    return
  }
  const extention = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extention}`;
  // resizing
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  // save photo to file system
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
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
  res.render('stores', {
    title: 'Stores',
    stores,
  });
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug });
  // res.json(store);
  if (!store) return next();
  res.render('store', {
    title: `${store.name} page`,
    store,
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