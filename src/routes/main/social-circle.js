const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const { isAdmin } = require('../../middleware/admin');
const { BadRequest, Unauthorized } = require('../../errors');
const SocialCircle = require('../../models/social-circle');
const User = require('../../models/user');
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

    if (!await SocialCircle.isValid(userId, userIds)) {
        throw new BadRequest('entered parameters are not valid.');
    }

    // push the user who created the social circle into the userIds array
    userIds.push(userId);

    const socialCircle = await SocialCircle.create({
      title,
      users: userIds,
      admin: userId
    });

    // TODO: notificate

    res.status(201).json(socialCircle);
  })
);

// PUT => /socialcircle/:socialcircleId/edit
router.put(
  '/:socialcircleId/edit',
  auth,
  //TODO: isAdmin middleware?
  catchAsync(async (req, res) => {
    const socialCircle = await validateRequestedSocialCircle(req.params);
    await socialCircleSchema.validateAsync(req.body, { abortEarly: false });
    const { userId } = req.session;
    const { userIds, title } = req.body;
    if (!await SocialCircle.isValid(userId, userIds)) {
        throw new BadRequest('entered parameters are not valid.');
    }
    userIds.push(userId);
    res
      .status(200)
      .json(
        await SocialCircle.findByIdAndUpdate(socialCircle.id, {
          title,
          users: userIds
        }, { new: true })
      );
  })
);

// DELETE => /socialcircle/:socialcircleId/delete
router.delete(
  '/:socialcircleId/delete',
  auth,
  //TODO: isAdmin middleware?
  catchAsync(async (req, res) => {
    const socialCircle = await validateRequestedSocialCircle(req.params);
    await SocialCircle.findByIdAndDelete(socialCircle.id);
    res.status(201).json({ message: 'Done.'});
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
