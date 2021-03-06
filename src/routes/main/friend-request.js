const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const { objectIdSchema, booleanSchema } = require('../../joi-schemas/utils');
const FriendRequest = require('../../models/friend-request');
const User = require('../../models/user');
const { Unauthorized, NotFound } = require('../../errors');
const {
  transactionOperations
} = require('../../services/mongo/transaction-operations');

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

    // if the session user is the requesting user remove the isActive property
    if (userId == friendRequest.requestedById) {
      const { isActive, ...fr } = friendRequest._doc;
      res.status(200).json({ ...fr, ...(await friendRequest.getUsernames()) });
      return;
    }
    res
      .status(200)
      .json({ ...friendRequest._doc, ...(await friendRequest.getUsernames()) });
  })
);

// POST => /friendrequest/:friendrequestId
router.post(
  '/:friendRequestId',
  auth,
  catchAsync(async (req, res) => {
    const { hasAccepted } = req.query;
    await booleanSchema.validateAsync({ bool: hasAccepted });

    const { friendRequestId } = req.params;
    await objectIdSchema.validateAsync({ id: friendRequestId });
    friendRequest = await FriendRequest.findById(friendRequestId);

    // friend request is invalid or inactive
    if (!friendRequest || !friendRequest.isActive) {
      throw new NotFound();
    }

    // validate session user is the target
    const { userId } = req.session;
    const user = await User.findById(userId);
    if (friendRequest.targetId != user.id) {
      throw new Unauthorized();
    }

    // validate requesting user is not blocked by target
    if (user.isBlackListed(friendRequest.requestedById)) {
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
          await User.findByIdAndUpdate(friendRequest.targetId, {
            $push: { friends: friendRequest.requestedById }
          }).session(session)
      );
      operations.push(
        async session =>
          await User.findByIdAndUpdate(friendRequest.requestedById, {
            $push: { friends: friendRequest.targetId }
          }).session(session)
      );

      // TODO: notificate

    } else {
      // if rejected check for a cross FR and delete it so the user who rejected the FR would be able to request the other user and thus preventing deadlock
      operations.push(
        async session =>
          await FriendRequest.findOneAndDelete({
            requestedById: friendRequest.targetId,
            targetId: friendRequest.requestedById
          }).session(session)
      );
    }

    // all these changes are entwined with each other make sure they are all done or non of them
    await transactionOperations(operations);

    res.status(201).json({ message: 'Done.' });
  })
);

module.exports = router;
