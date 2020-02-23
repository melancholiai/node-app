const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    authUserId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
      unique: true
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    blackList: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post'
      }
    ]
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;