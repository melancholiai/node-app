const User = require('../models/user');
const { NotFound, Unauthorized, BadRequest } = require('../errors');

module.exports.nonBlackList = async (req, res, next) => {
  const { userId } = req.session;

  const requestingUser = await User.findById(userId);

  // for blacklisted user respond with not found
  if (requestingUser.blackList.includes(req.params.userId)) {
    return next(new NotFound());
  }
  next();
};

module.exports.blackListed = async (req, res, next) => {
  const { userId } = req.session;

  const requestingUser = await User.findById(userId);

  // user should be blacklisted by the session user
  if (!requestingUser.blackList.includes(req.params.userId)) {
    return next(new BadRequest());
  }
  next();
};

module.exports.nonFriend = async (req, res, next) => {
  const { userId } = req.session;

  const requestingUser = await User.findById(userId);
  if (requestingUser.friends.includes(req.params.userId)) {
    return next(
      new Unauthorized(
        'Could not proceed because requested user and yourself are already friends.'
      )
    );
  }
  next();
};
