const mongoose = require('mongoose');

const User = require('./user');

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

friendRequestSchema.statics.alreadyExist = async function(requester, target) {
  // validate there is no existing request
  if ((await this.where({ requestedById: requester, targetId: target }).countDocuments()) !== 0) {
      return true;
  }
  // validate there is no cross friend request which is active
  if (await this.where({ requestedById: target, targetId: requester, isActive: true }).countDocuments() !== 0) {
    return true;
  }
  return false;
};

friendRequestSchema.methods.getUsernames = async function() {
  const requestedBy = await User.findById(this.requestedById);
  const target = await User.findById(this.targetId);
  return {
    requestedByUsername: (await requestedBy.getAuthUser()).username,
    targetUsername: (await target.getAuthUser()).username
  };
};

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
module.exports = FriendRequest;
