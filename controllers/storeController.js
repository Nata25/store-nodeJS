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