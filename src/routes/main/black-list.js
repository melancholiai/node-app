const { Router } = require('express');

const { catchAsync } = require('../../middleware/errors');
const { auth } = require('../../middleware/auth');
const { editBlackListSchema } = require('../../joi-schemas/black-list');
const User = require('../../models/user');
const { BadRequest } = require('../../errors');
const { existingDocuments } = require('../../services/mongo/mongo-actions');
const { HttpResponse } = require('../../models/custom/http-response');

const router = Router();

// PATCH => userarea/blacklist/edit
router.patch(
  '/edit',
  auth,
  catchAsync(async (req, res) => {
    const { userIds } = req.body;
    await editBlackListSchema.validateAsync({ userIds }, { abortEarly: false });

    // validate the session user isn't about to block himself
    const { userId } = req.session;
    if (userIds.includes(userId)) {
      throw new BadRequest('You cannot black list yourself.');
    }

    // validate there is an existing user for every provided userid to block
    if (!await existingDocuments(User, '_id', userIds)) {
      throw new BadRequest('One or more users entered are invalid');
    }

    // remove friends if they are set to be black listed
    const user = await User.findById(userId);
    const newFriendsList = user.friends.filter(friendId => !userIds.includes(friendId.toString()));
    
    await User.findOneAndUpdate(
      { _id: userId },
      { $set: { blackList: userIds, friends: newFriendsList } }
    );

    res.status(200).json(new HttpResponse('Blacklist was edited successfully'));
  })
);

// PATCH => userarea/blacklist/clear
router.patch(
  '/clear',
  auth,
  catchAsync(async (req, res) => {
    const { userId } = req.session;
    await User.findOneAndUpdate({ _id: userId }, { $set: { blackList: [] } });
    res.status(200).json(new HttpResponse('Blacklist is now clear.'));
  })
);

module.exports = router;
