const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const { objectIdSchema } = require('../../joi-schemas/utils');
const FriendRequest = require('../../models/friend-request');
const User = require('../../models/user');
const { Unauthorized, NotFound } = require('../../errors');

const router = Router();

// TODO: get with simple info to the requestedBy \ target
router.get(
  '/:friendRequestId',
  auth,
  catchAsync(async (req, res) => {})
);

// POST => /friendrequest/:friendrequestId
router.post(
  '/:friendRequestId',
  auth,
  catchAsync(async (req, res) => {
    const { friendRequestId } = req.params;
    await objectIdSchema.validateAsync({ id: friendRequestId });
    friendRequest = await FriendRequest.findById(friendRequestId);

    // friend request is invalid \ inactive \ session user isn't the target \ requesting user is blocked by target
    if (!friendRequest || !friendRequest.isActive) {
      throw new NotFound();
    }

    const { userId } = req.session;
    const user = await User.findOne({ authUserId: userId });
    if (friendRequest.targetId != user.id) {
      throw new Unauthorized();
    }

    if (user.isBlackListed(friendRequest.requestedById)) {
      throw new NotFound();
    }

    //TODO: create session for these db transactions

    // updated the friend request to inactive
    await friendRequest.update({ isActive: false });

    // if the request was accepted push on the user's docs the other user as a friend and for the requesting user send a notification
    const { hasAccepted } = req.query;
    if (hasAccepted) {
      await User.findByIdAndUpdate(friendRequest.targetId, {
        $push: { friends: friendRequest.requestedById }
      });
      await User.findByIdAndUpdate(friendRequest.requestedById, {
        $push: { friends: friendRequest.targetId }
      });
    }

    // TODO: notificate

    res.status(201).json({ message: 'Done.' });
  })
);

module.exports = router;
