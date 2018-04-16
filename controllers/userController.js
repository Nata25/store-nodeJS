const mongoose = require('mongoose');
const promisify = require('es6-promisify');

const User = mongoose.model('User');

exports.loginForm = (req, res) => {
  res.render('loginForm', {
    title: 'Login'
  });
}

exports.registerForm = (req, res) => {
  res.render('registerForm', {
    title: 'Register',
    body: {}
  });
}

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'You should provide a valid email!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody('password', 'Password cannot be blank!').notEmpty();
  req.checkBody('confirmPassword', 'Confirmed password cannot be blank!').notEmpty();
  req.checkBody('confirmPassword', 'Passwords don\'t match!').equals(req.body.password);
  const errors = req.validationErrors();
  
  if (errors) {
    req.flash('error', errors.map( err => err.msg ));
    res.render('registerForm', {
      title: 'Register',
      body: req.body,
      flashes: req.flash()
    });
    return;
  }
  next();
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
  });
  // User.register(user, req.body.password, function(err, user) {
    // callback code needed if don't use promisify
  // });
  const registerWithPromise = promisify(User.register, User);
  await registerWithPromise(user, req.body.password);
  next();
};