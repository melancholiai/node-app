const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const { objectIdSchema } = require('../../joi-schemas/utils');
const User = require('../../models/user');

const router = Router();


// GET => /user/me
router.get(
  '/me',
  auth,
  catchAsync(async (req, res) => {
    const { userId } = req.session;
    res.status(200).json(await User.findOne({ authUserId: userId}));
  })
);

// GET => /user/:userId
router.get(
  '/:userId',
  auth,
  catchAsync(async (req, res) => {
    const requestedId = req.params.userId;
    await objectIdSchema.validateAsync({ id: requestedId });
    const { userId } = req.session;

    const requestingUser = await User.findOne({ authUserId: userId} );

    if (requestingUser.id === requestedId) {
      // redirect to /user/me
      // res.redirect('/user/me')
    }
  
    if (requestingUser.blackList.includes(requestedId)) {
      // requested user not found
      // return res.status(404).json({ message: "Could not find any user."});  
    }

    res.status(200).json(await User.findById(requestedId));
  })
);

// GET => /user/:userId
router.get(
  '/:userId',
  auth,
  catchAsync(async (req, res) => {
    const requestedId = req.params.userId;
    await objectIdSchema.validateAsync({ id: requestedId });
    const { userId } = req.session;

    const requestingUser = await User.findOne({ authUserId: userId} );

    if (requestingUser.id === requestedId) {
      // redirect to /user/me
      // res.redirect('/user/me')
    }
  
    if (requestingUser.blackList.includes(requestedId)) {
      // requested user not found
      // return res.status(404).json({ message: "Could not find any user."});  
    }

    res.status(200).json(await User.findById(requestedId));
  })
);


module.exports = router;