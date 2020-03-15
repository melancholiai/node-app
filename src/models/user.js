const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    authUser: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
      unique: true
    },
    username: {
      type: String,
      required: true,
      unique: true
    },
    avatar: {
      type: String
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

userSchema.methods.getData = async function(requestingId) {
  // TODO: needed?
  if (this.id === requestingId) {
    // return this;
  }

  const data = {
    id: this.id,
    username: this.username,
    avatar: this.avatar,
    posts: this.getPosts(requestingId)
  };

  const friendsData = await Promise.all(this.friends.map(async friendId => 
    await User.findById(friendId).select('id username avatar')
  ));

  // friends will recieve a friend list of the other user and all his posts
  if (this.friends.includes(requestingId) || this.id === requestingId) {
    return {
      ...data,
      friends: friendsData
    };
  }

  // non friends will recieve the other user's public posts only
  return data;
};

userSchema.methods.getPosts = function(requestingId) {
  if (this.friends.includes(requestingId) || this.id === requestingId) {
    return this.posts;
  } else {
    return this.posts.filter(p => p.isPublic);
  }
};

userSchema.methods.isBlackListed = function(otherUserId) {
  if (this.blackList.includes(otherUserId)) {
    return true;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
