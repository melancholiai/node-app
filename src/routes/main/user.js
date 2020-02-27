const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const {
  nonBlackList,
  nonFriend,
  blackListed
} = require('../../middleware/relationship');
const { objectIdSchema } = require('../../joi-schemas/utils');
const User = require('../../models/user');
const FriendRequest = require('../../models/friend-request');
const {
  notificate,
  NOTIFICATION_TYPES
} = require('../../util/notification-handler');
const SocialCircle = require('../../models/social-circle');
const { BadRequest, Unauthorized, NotFound } = require('../../errors');
const {
  transactionOperations
} = require('../../services/mongo/transaction-operations');

const router = Router();

// GET => /user/me
router.get(
  '/me',
  auth,
  catchAsync(async (req, res) => {
    const { userId } = req.session;
    const user = await User.findById(userId);
    const authUser = await user.getAuthUser();
    res.status(200).json({ ...user._doc, authUser });
  })
);

// PATCH => /user/me
router.patch(
  '/me',
  [auth],
  catchAsync(async (req, res) => {
    // TODO: update avatar
  })
);

// GET => /user/:userId
router.get(
  '/:userId',
  [auth, nonBlackList],
  catchAsync(async (req, res) => {
    const requestedUser = await validateRequestedUser(req.params.userId);

    const { userId } = req.session;
    const requestingUser = await User.findById(userId);
    if (requestingUser.id === requestedUser.id) {
      res.status(302).redirect('/user/me');
      return;
    }

    // get the data based on the relationship between the two
    res.status(200).json(await requestedUser.getData(requestingUser.id));
  })
);

// GET => /user/:userId/posts
router.get(
  '/:userId/posts',
  [auth, nonBlackList],
  catchAsync(async (req, res) => {
    const requestedUser = await validateRequestedUser(req.params.userId);

    const { userId } = req.session;
    const requestingUser = await User.findById(userId);
    if (requestingUser.id === requestedUser.id) {
      res.status(302).redirect('/user/me');
      return;
    }

    res.status(200).json(requestedUser.getPosts(requestingUser.id));
  })
);

// POST => /user/:userId/friend
router.post(
  '/:userId/friend',
  [auth, nonBlackList, nonFriend],
  catchAsync(async (req, res) => {
    const requestedUser = await validateRequestedUser(req.params.userId);

    const { userId } = req.session;
    const requestingUser = await User.findById(userId);
    if (requestingUser.id === requestedUser.id) {
      throw new BadRequest('You cannot friend request yourself.');
    }

    // the other user might have declined or ignored the request
    if (await FriendRequest.alreadyExist(requestingUser.id, requestedUser.id)) {
      throw new Unauthorized(
        'Could not send a request because an active request has been sent in the past.'
      );
    }

    const newFriendRequest = await FriendRequest.create({
      requestedById: requestingUser.id,
      targetId: requestedUser.id,
      isActive: true
    });

    await notificate(
      requestingUser.id,
      requestedUser.id,
      newFriendRequest.id,
      NOTIFICATION_TYPES.sentFriendRequest
    );

    res.status(200).json(newFriendRequest);
  })
);

// GET => /user/me/socialcircles
router.get(
  '/:userId/socialcircles',
  [auth, nonBlackList],
  catchAsync(async (req, res) => {
    const requestedUserToAdd = await validateRequestedUser(req.params.userId);
    const { userId } = req.session;

    // substracting the limited data from the full data
    const socialCircles = await SocialCircle.find({
      users: { $in: [requestedUserToAdd.id] }
    });
    const full = socialCircles.filter(sc => sc.users.includes(userId));
    const limited = socialCircles.filter(sc => !sc.users.includes(userId));
    let immutableArray = limited.map(x => x._doc);
    immutableArray = immutableArray.map(({ users, ...rest }) => rest);
    res.status(200).json([...full, ...immutableArray]);
  })
);

// POST => /user/:userId/blacklist/add
router.post(
  '/:userId/blacklist/add',
  [auth, nonBlackList],
  catchAsync(async (req, res) => {
    const requestedUserToAdd = await validateRequestedUser(req.params.userId);
    const { userId } = req.session;
    if (requestedUserToAdd.id === userId) {
      throw new BadRequest('Cannot blacklist yourself.');
    }
    const user = await User.findById(userId);

    const operations = [];

    // remove these users from each other's friends list if they're friends
    if (user.friends.includes(requestedUserToAdd.id)) {
      operations.push(
        async session =>
          await User.findByIdAndUpdate(
            userId,
            {
              $pull: { friends: requestedUserToAdd.id }
            },
            { safe: true }
          ).session(session)
      );
      operations.push(
        async session =>
          await User.findByIdAndUpdate(
            requestedUserToAdd.id,
            {
              $pull: { friends: userId }
            },
            { safe: true }
          ).session(session)
      );
    }

    operations.push(
      async session =>
        await User.findByIdAndUpdate(userId, {
          $push: { blackList: { _id: requestedUserToAdd.id } }
        }).session(session)
    );

    // all these changes are entwined with each other make sure they are all done or non of them
    await transactionOperations(operations);

    res.status(200).json('Added to blacklist.');
  })
);

// POST => /user/:userId/blacklist/remove
router.post(
  '/:userId/blacklist/remove',
  [auth, blackListed],
  catchAsync(async (req, res) => {
    const requestedUserToRemove = await validateRequestedUser(
      req.params.userId
    );
    const { userId } = req.session;
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { blackList: requestedUserToRemove.id }
      },
      { safe: true }
    );
    res.status(200).json('Removed from blacklist.');
  })
);

const validateRequestedUser = async userId => {
  const requestedId = userId;
  await objectIdSchema.validateAsync({ id: requestedId });
  const requestedUser = await User.findById(requestedId);
  if (!requestedUser) {
    throw new NotFound();
  }
  return requestedUser;
};

module.exports = router;
