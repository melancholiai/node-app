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

// check if a friend request with the combination of the requester and the target already exists
friendRequestSchema.statics.doesntExist = async function(requester, target) {
  return ((await this.where({ requestedById: requester, targetId: target}).countDocuments()) === 0 &&
  (await this.where({ requestedById: target, targetId: requester}).countDocuments()) === 0);
};

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
module.exports = FriendRequest;
