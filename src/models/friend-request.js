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

// check if a friend request with the combination of the requester and the target already exists
friendRequestSchema.statics.doesntExist = async function(requester, target) {
  //TODO: should go both ways?
  // return ((await this.where({ requestedById: requester, targetId: target}).countDocuments()) === 0 &&
  // (await this.where({ requestedById: target, targetId: requester}).countDocuments()) === 0);
  return (
    (await this.where({
      requestedById: requester,
      targetId: target
    }).countDocuments()) === 0
  );
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
