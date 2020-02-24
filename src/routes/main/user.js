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
const Notification = require('../../models/notification');
const { Unauthorized, NotFound } = require('../../errors');

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
      res.status(302).redirect('/user/me');
      return;
    }

    if (
      !(await FriendRequest.doesntExist(requestingUser.id, requestedUser.id))
    ) {
      throw new Unauthorized(
        'Could not send a request because an active request has been sent in the past.'
      );
    }

    // TODO: factory for entity-notification
    const newFriendRequest = await FriendRequest.create({
      requestedById: requestingUser.id,
      targetId: requestedUser.id,
      isActive: true
    });

    // check if the requested user had black listed the requesting user, if so don't sent a notification
    if (!requestedUser.blackList.includes(requestingUser.id)) {
      await Notification.create({
        notifiedById: requestingUser.id,
        targetId: requestedUser.id,
        notificationType: 'friendRequest',
        entityId: newFriendRequest.id,
        onEntity: 'FriendRequest',
        isRead: false
      });
    }
    res.status(200).json(newFriendRequest);
  })
);

// POST => /user/:userId/blacklist/add
router.post(
  '/:userId/blacklist/add',
  [auth, nonBlackList],
  catchAsync(async (req, res) => {
    const requestedUserToAdd = await validateRequestedUser(req.params.userId);
    const { userId } = req.session;
    const user = await User.findById(userId);

    // remove from these users from each other's friends list if exists there
    // TODO: do in one session
    if (user.friends.includes(requestedUserToAdd.id)) {
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: { friends: requestedUserToAdd.id }
        },
        { safe: true }
      );
      await User.findByIdAndUpdate(
        requestedUserToAdd.id,
        {
          $pull: { friends: userId }
        },
        { safe: true }
      );
    }

    // push to black list
    await User.findByIdAndUpdate(userId, {
      $push: { blackList: { _id: requestedUserToAdd.id } }
    });
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
