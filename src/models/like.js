const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const likeSchema = new Schema(
  {
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

const Like = mongoose.model('Like', likeSchema);
module.exports = Like;
