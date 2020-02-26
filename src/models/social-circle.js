const mongoose = require('mongoose');

const User = require('./user');

const Schema = mongoose.Schema;

const socialCircleSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

socialCircleSchema.statics.isValid = async function(creatingUserId, enteredUsers) {
  // validate the creating user is not on the body array
    if (enteredUsers.includes(creatingUserId)) {
      return false;
    }
    // validate every user id is a valid user in the database by finding and counting them all against entered users
    const idsFound = await User.where('_id')
      .in(enteredUsers)
      .countDocuments();
    
    if (idsFound !== enteredUsers.length) {
      return false
    }
    return true;
}

const SocialCircle = mongoose.model('SocialCircle', socialCircleSchema);
module.exports = SocialCircle;
