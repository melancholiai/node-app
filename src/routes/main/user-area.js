const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const User = require('../../models/user');
const Post = require('../../models/post');
const Notification = require('../../models/notification');
const { objectIdSchema } = require('../../joi-schemas/utils');
const { NotFound } = require('../../errors');

const router = Router();

// GET => /userarea
router.get(
  '/',
  auth,
  catchAsync(async (req, res) => {
    const { userId } = req.session;
    const user = await await User.findById(userId)
      .populate('authUser')
      .populate({ path: 'friends', select: 'username' })
      .populate({ path: 'blackList', select: 'username' })
      .populate({ path: 'posts' });
    res.status(200).json(user);
  })
);

// PATCH => /userarea
router.patch(
  '/',
  auth,
  catchAsync(async (req, res) => {
    // TODO: update avatar
  })
);

// GET => /userarea/notifications
router.get(
  '/notifications',
  auth,
  catchAsync(async (req, res) => {
    const { userId } = req.session;
    res
      .status(200)
      .json(await Notification.find({ target: userId }).sort('-createdAt'));
  })
);

// GET => /userarea/notifications
router.get(
  '/notifications/unread',
  auth,
  catchAsync(async (req, res) => {
    const { userId } = req.session;
    res
      .status(200)
      .json(
        await Notification.find({ target: userId, isRead: false }).sort(
          '-createdAt'
        )
      );
  })
);

// PATCH => /userarea/notifications/:nofificationId
router.patch(
  '/notifications/:notificationId',
  auth,
  catchAsync(async (req, res) => {
    const { notificationId } = req.params;
    await objectIdSchema.validateAsync(notificationId);
    const { userId } = req.session;
    const found = await Notification.findOneAndUpdate(
      { _id: notificationId, target: userId, isRead: false },
      { isRead: true }
    );
    if (!found) {
      throw new NotFound();
    }
    res.status(200).json({ message: 'Notification Read' });
  })
);

module.exports = router;
