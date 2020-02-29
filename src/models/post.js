const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const postSchema = new Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    imageUrl: {
      type: String,
      required: true,
      unique: true
    },
    location: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      },
      required: false// was true
    },
    description: {
      type: String
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Likes'
      }
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag'
      }
    ],
    taggedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isPublic: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
