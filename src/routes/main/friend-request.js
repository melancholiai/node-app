const mongoose = require('mongoose');
const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const { objectIdSchema } = require('../../joi-schemas/utils');
const {
  socialCircleSchema
} = require('../../joi-schemas/friend-request-schema');
const { notificate, NOTIFICATION_TYPES } = require('../../util/notification-handler');
const FriendRequest = require('../../models/friend-request');
const User = require('../../models/user');
const { Unauthorized, NotFound } = require('../../errors');
const { transactionOperations } = require('../../services/mongo/transaction-operations');
const { HttpResponse } = require('../../models/custom/http-response');

const router = Router();

// GET => /friendrequest/:friendrequestId
router.get(
  '/:friendRequestId',
  auth,
  catchAsync(async (req, res) => {
    const { friendRequestId } = req.params;
    await objectIdSchema.validateAsync(friendRequestId);
    const friendRequest = await FriendRequest.findById(friendRequestId)
      .populate({ path: 'requestedBy', select: 'username' })
      .populate({ path: 'target', select: 'username' });
    if (!friendRequest) {
      throw new NotFound();
    }

    // check the session user is part of the friend request
    const { userId } = req.session;
    if (
      userId != friendRequest.requestedBy.id &&
      userId != friendRequest.target.id
    ) {
      throw new Unauthorized();
    }

    // if the session user is the requesting user remove the isActive property
    if (userId == friendRequest.requestedBy.id) {
      const { isActive, ...fr } = friendRequest._doc;
      res.status(200).json({...fr});
      return;
    }
    res
      .status(200)
      .json(friendRequest);
  })
);

// POST => /friendrequest/:friendrequestId
router.post(
  '/:friendRequestId',
  auth,
  catchAsync(async (req, res) => {
    const { hasAccepted } = req.query;
    const { friendRequestId } = req.params;
    await socialCircleSchema.validateAsync({ friendRequestId, hasAccepted });

    // friend request is valid or active and targeted for the session user
    const { userId } = req.session;
    friendRequest = await FriendRequest.findOne({
      _id: friendRequestId,
      isActive: true,
      target: userId
    });
    if (!friendRequest) {
      throw new NotFound();
    }

    // validate requesting user is not blocked by target - the FR shouldn't have arrived extra layer of security
    if (
      (await User.findOne({
        _id: userId,
        blackList: mongoose.Types.ObjectId(friendRequest.requestedBy)
      })) !== null
    ) {
      throw new NotFound();
    }

    const operations = [];

    // updated the friend request to inactive
    operations.push(
      async session =>
        await friendRequest.updateOne({ isActive: false }).session(session)
    );

    // if the request was accepted push on the user's docs the other user as a friend and for the requesting user send a notification
    if (hasAccepted == 'true') {
      operations.push(
        async session =>
          await User.findByIdAndUpdate(friendRequest.target, {
            $push: { friends: friendRequest.requestedBy }
          }).session(session)
      );
      operations.push(
        async session =>
          await User.findByIdAndUpdate(friendRequest.requestedBy, {
            $push: { friends: friendRequest.target }
          }).session(session)
      );

      // notificate friend request accepted, doesn't need to be on session
      await notificate(
        friendRequest.target,
        friendRequest.requestedBy,
        friendRequest.id,
        NOTIFICATION_TYPES.ACCEPTED_FRIEND_REQUEST
      );
    } else {
      // if rejected check for a cross FR and delete it so the user who rejected the FR would be able to request the other user and thus preventing deadlock
      operations.push(
        async session =>
          await FriendRequest.findOneAndDelete({
            requestedBy: friendRequest.target,
            target: friendRequest.requestedBy
          }).session(session)
      );
    }

    // all these changes are entwined with each other make sure they are all done or non of them
    await transactionOperations(operations);

    res.status(201).json(new HttpResponse('Done.'));
  })
);

module.exports = router;
