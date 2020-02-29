const mongoose = require('mongoose');

const { NOTIFICATION_TYPES } = require('../util/notification-handler');

const Schema = mongoose.Schema;
const notificationSchema = new Schema(
  {
    notifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    target: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    entity: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'onEntity'
    },
    onEntity: {
      type: String,
      required: true,
      enum: ['FriendRequest', 'Post', 'Comment', 'SocialCircle']
    },
    notificationType: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
