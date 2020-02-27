const Notification = require('../models/notification');
const { existingDocuments } = require('../services/mongo/mongo-actions');
const User = require('../models/user');

const NOTIFICATION_TYPES = {
  commented: { value: 'commented', entity: 'Comment' },
  likedPost: { value: 'likedPost', entity: 'Post' },
  likedComment: { value: 'likedComment', entity: 'Comment' },
  sentFriendRequest: { value: 'sentFriendRequest', entity: 'FriendRequest' },
  acceptedFriendRequest: {
    value: 'acceptedFriendRequest',
    entity: 'FriendRequest'
  },
  addedToSocialCircle: { value: 'addedToSocialCircle', entity: 'SocialCircle' },
  taggedOnPost: { value: 'taggedOnPost', entity: 'Post' }
};

exports.notificate = async (byId, toId, entityId, type) => {
  if (!isValid(byId, toId, type)) {
    return null;
  }

  return await Notification.create({
    notifiedById: byId,
    targetId: toId,
    entityId,
    onEntity: type.entity,
    notificationType: type.value
  });
};

const isValid = async (byId, toId, type) => {
  // validate users exist
  if (!(await existingDocuments(User, '_id', [byId, toId]))) {
    return false;
  }
  // FIXME: bug
  // check if the target user is blocking the notificating user, if so don't notify
  const user = await User.findOne( { _id: toId, blackList: mongoose.Types.ObjectId(byId) });
  return user === null;
};

exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
