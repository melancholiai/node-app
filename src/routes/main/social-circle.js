const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const { isAdmin } = require('../../middleware/admin');
const { BadRequest, Unauthorized } = require('../../errors');
const SocialCircle = require('../../models/social-circle');
const { notificate, NOTIFICATION_TYPES } = require('../../util/notification-handler');
const { socialCircleSchema } = require('../../joi-schemas/social-circle');
const { objectIdSchema } = require('../../joi-schemas/utils');

const router = Router();

// GET=> /socialcircle/:socialcircleId
router.get(
  '/:socialcircleId',
  auth,
  catchAsync(async (req, res) => {
    const socialCircle = await validateRequestedSocialCircle(req.params);
    const { userId } = req.session;
    if (!socialCircle.users.includes(userId)) {
      throw new Unauthorized('Only members of the circle can view this.');
    }

    res.status(200).json(socialCircle);
  })
);

// GET=> /socialcircle
router.get(
  '/',
  auth,
  catchAsync(async (req, res) => {
    const socialCircles = await SocialCircle.find().select('title admin');
    res.status(200).json(socialCircles);
  })
);

// POST => /socialcircle
router.post(
  '/',
  auth,
  catchAsync(async (req, res) => {
    await socialCircleSchema.validateAsync(req.body, { abortEarly: false });
    const { userId } = req.session;
    const { userIds, title } = req.body;

    if (!(await SocialCircle.isValid(userId, userIds))) {
      throw new BadRequest('entered parameters are not valid.');
    }

    const socialCircle = await SocialCircle.create({
      title,
      users: [...userIds, userId],
      admin: userId
    });

    for (targetId of userIds) {
      await notificate(
        userId,
        targetId,
        socialCircle.id,
        NOTIFICATION_TYPES.addedToSocialCircle
      );
    }

    res.status(201).json(socialCircle);
  })
);

// PUT => /socialcircle/:socialcircleId/edit
router.put(
  '/:socialcircleId/edit',
  [auth, isAdmin(SocialCircle, 'params.socialcircleId')],
  catchAsync(async (req, res) => {
    const socialCircle = await validateRequestedSocialCircle(req.params);
    await socialCircleSchema.validateAsync(req.body, { abortEarly: false });
    const { userId } = req.session;
    const { userIds, title } = req.body;
    if (!(await SocialCircle.isValid(userId, userIds))) {
      throw new BadRequest('entered parameters are not valid.');
    }
    userIds.push(userId);
    res.status(200).json(
      await SocialCircle.findByIdAndUpdate(
        socialCircle.id,
        {
          title,
          users: userIds
        },
        { new: true }
      )
    );
  })
);

// DELETE => /socialcircle/:socialcircleId/delete
router.delete(
  '/:socialcircleId/delete',
  [auth, isAdmin(SocialCircle, 'params.socialcircleId')],
  catchAsync(async (req, res) => {
    const socialCircle = await validateRequestedSocialCircle(req.params);
    await SocialCircle.findByIdAndDelete(socialCircle.id);
    res.status(201).json({ message: 'Done.' });
  })
);

const validateRequestedSocialCircle = async ({ socialcircleId }) => {
  await objectIdSchema.validateAsync({ id: socialcircleId });
  const socialCircle = await SocialCircle.findById(socialcircleId);
  if (!socialCircle) {
    throw new BadRequest('Could not find the requested social circle');
  }
  return socialCircle;
};

module.exports = router;
