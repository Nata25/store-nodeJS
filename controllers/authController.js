const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const promisify = require('es6-promisify');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Something went wrong, try again!',
  successRedirect: '/',
  successFlash: 'You successfully logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You successfully logged out!');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('error', 'You must be logged in');
    res.redirect('/login');
  }
};

exports.forgot = async (req, res) => {
  // 1. see is user exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account for the address found.');
    res.redirect('/login');
    return;
  }

  // 2. reset tokens and expiry on the account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();
  
  // 3. Send email with token
  const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success', `You have been emailed a password reset link ${resetUrl}`);
  
  // 4. redirect to login page
  res.redirect('/login');
};

exports.checkUser = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash('error', 'Password reset token invalid or expired.');
    res.redirect('/login');
    return;
  }
  req.user = user;
  next();
}

exports.reset = async (req, res) => {
  res.render('reset', {
    title: 'Reset your password'
  });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body.confirmPassword) {
    next();
    return;
  }
  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
}


exports.update = async (req, res) => {
  const user = req.user;
  const setPassword = promisify(user.setPassword, user); // promisifying user.setPassword() method from passport.js
  await setPassword(req.body.password); // wait until data are updated and attached to the user
  user.resetPasswordToken = undefined; // wipe up db from temporarily data
  user.resetPasswordExpires = undefined; // wipe up db from temporarily data
  const updatedUser = await user.save(); // after new user is upddated in DB, get new user object
  await req.login(updatedUser); // passport.js logs new user in (password hashed+salted)
  req.flash('success', 'You password has been reset!');
  res.redirect('/');

}