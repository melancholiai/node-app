const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    commentedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    body: {
      type: String,
      required: true
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Likes'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
