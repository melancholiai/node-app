const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const friendRequestSchema = new Schema(
  {
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    target: {
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
  if ((await this.where({ requestedBy: requester, target: target }).countDocuments()) !== 0) {
      return true;
  }
  // validate there is no cross friend request which is active
  if (await this.where({ requestedBy: target, target: requester, isActive: true }).countDocuments() !== 0) {
    return true;
  }
  return false;
};

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
module.exports = FriendRequest;
