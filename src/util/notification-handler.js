const mongoose = require('mongoose');

const Notification = require('../models/notification');
const { existingDocuments } = require('../services/mongo/mongo-actions');
const User = require('../models/user');

const NOTIFICATION_TYPES = {
  COMMENTED: { value: 'commented', entity: 'Comment' },
  LIKED_POST: { value: 'likedPost', entity: 'Post' },
  LIKED_COMMENT: { value: 'likedComment', entity: 'Comment' },
  SENT_FRIEND_REQUEST: { value: 'sentFriendRequest', entity: 'FriendRequest' },
  ACCEPTED_FRIEND_REQUEST: { value: 'acceptedFriendRequest', entity: 'FriendRequest' },
  ADDED_TO_SOCIAL_CIRCLE: { value: 'addedToSocialCircle', entity: 'SocialCircle' },
  TAGGED_ON_POST: { value: 'taggedOnPost', entity: 'Post' }
};

exports.notificate = async (byId, toId, entityId, type) => {
  if (await isValid(byId, toId, type)) {
    return await Notification.create({
      notifiedBy: byId,
      target: toId,
      entity: entityId,
      onEntity: type.entity,
      notificationType: type.value
    });
  }
};

const isValid = async (byId, toId, type) => {
  // validate users exist
  if (!(await existingDocuments(User, '_id', [byId, toId]))) {
    return false;
  }
  // check if the target user is blocking the notificating user. if so don't notify
  return (
    (await User.findOne({
      _id: toId,
      blackList: mongoose.Types.ObjectId(byId)
    })) === null
  );
};

exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
