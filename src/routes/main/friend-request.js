const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const { objectIdSchema } = require('../../joi-schemas/utils');
const FriendRequest = require('../../models/friend-request');
const User = require('../../models/user');
const { Unauthorized, NotFound, BadRequest } = require('../../errors');

const router = Router();

// GET => /friendrequest/:friendrequestId
router.get(
  '/:friendRequestId',
  auth,
  catchAsync(async (req, res) => {
    const { friendRequestId } = req.params;
    await objectIdSchema.validateAsync({ id: friendRequestId });
    const friendRequest = await FriendRequest.findById(friendRequestId);
    if (!friendRequest) {
      throw new NotFound();
    }

    // check the session user is part of the friend request
    const { userId } = req.session;
    if (
      userId != friendRequest.requestedById &&
      userId != friendRequest.targetId
    ) {
      throw new Unauthorized();
    }
    res.status(200).json({...friendRequest._doc, ...await friendRequest.getUsernames()});
  })
);

// POST => /friendrequest/:friendrequestId
router.post(
  '/:friendRequestId',
  auth,
  catchAsync(async (req, res) => {
    const { hasAccepted } = req.query;
    if (hasAccepted === undefined) {
      throw new BadRequest();
    }
    
    const { friendRequestId } = req.params;
    await objectIdSchema.validateAsync({ id: friendRequestId });
    friendRequest = await FriendRequest.findById(friendRequestId);

    // friend request is invalid \ inactive 
    if (!friendRequest || !friendRequest.isActive) {
      throw new NotFound();
    }

    // validate session user is the target
    const { userId } = req.session;
    const user = await User.findById(userId);
    if (friendRequest.targetId != user.id) {
      throw new Unauthorized();
    }
    
    // validate requesting user is blocked by target
    if (user.isBlackListed(friendRequest.requestedById)) {
      throw new NotFound();
    }

    //TODO: create session for these db transactions

    // updated the friend request to inactive
    await friendRequest.update({ isActive: false });

    // if the request was accepted push on the user's docs the other user as a friend and for the requesting user send a notification
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
