const { isLoggedIn } = require('../util/auth');
const { BadRequest, Unauthorized } = require('../errors/index');

module.exports.guest = (req, res, next) => {
  if (isLoggedIn(req)) {
    return next(new BadRequest('You are already logged in'));
  }
  next();
};

module.exports.auth = (req, res, next) => {
  if (!isLoggedIn(req)) {
    return next(new Unauthorized('You must be logged in'));
  }

  next();
};
