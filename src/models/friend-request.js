const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const friendRequestSchema = new Schema(
  {
    requestedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean
    }
  },
  {
    timestamps: true
  }
);

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
module.exports = FriendRequest;
