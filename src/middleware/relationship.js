const User = require('../models/user');
const { NotFound } = require('../errors');

module.exports.nonBlackList = async (req, res, next) => {
    const { userId } = req.session;

    const requestingUser = await User.findOne({ authUserId: userId} );

    // for blacklisted user respond with not found
    if (requestingUser.blackList.includes(req.params.userId)) {
        throw new NotFound();
      };
    next();
};
