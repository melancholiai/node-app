const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    notifiedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notificationType: {
      type: String,
      enum: ['commented', 'likedPost', 'likedComment', 'friendRequest'],
      required: true
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'onEntity'
    },
    onEntity: {
      type: String,
      required: true,
      enum: ['FriendRequest', 'Regular'],
      default: 'Regular'
    },
    isRead: {
      type: Boolean
    }
  },
  {
    timestamps: true
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
