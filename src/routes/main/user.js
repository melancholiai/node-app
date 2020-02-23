const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const { nonBlackList } = require('../../middleware/relationship');
const { objectIdSchema } = require('../../joi-schemas/utils');
const User = require('../../models/user');
const FriendRequest = require('../../models/friend-request');
const Notification = require('../../models/notification');
const { BadRequest, Unauthorized, NotFound } = require('../../errors');

const router = Router();

// GET => /user/me
router.get(
  '/me',
  auth,
  catchAsync(async (req, res) => {
    const { userId } = req.session;
    const user = await User.findOne({ authUserId: userId });
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
    const requestingUser = await User.findOne({ authUserId: userId });
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
    const requestingUser = await User.findOne({ authUserId: userId });
    if (requestingUser.id === requestedUser.id) {
      res.status(302).redirect('/user/me');
      return;
    }

    res.status(200).json(requestedUser.getPosts(requestingUser.id));
  })
);

// GET => /user/:userId/friendRequest
router.post(
  '/:userId/friendRequest',
  [auth, nonBlackList],
  catchAsync(async (req, res) => {
    const requestedUser = await validateRequestedUser(req.params.userId);

    const { userId } = req.session;
    const requestingUser = await User.findOne({ authUserId: userId });
    if (requestingUser.id === requestedUser.id) {
      res.status(302).redirect('/user/me');
      return;
    }

    if (requestingUser.friends.includes(requestedUser.id)) {
      throw new Unauthorized(
        "Could not send a request because You're already friends."
      );
    }

    if (
      !(await FriendRequest.doesntExist(requestingUser.id, requestedUser.id))
    ) {
      throw new Unauthorized(
        'Could not send a request because a request has been sent in the past.'
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
    res.status(200).json({ message: 'friend requested sent.' });
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
