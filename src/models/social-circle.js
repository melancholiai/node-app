const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const socialCircleSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

const SocialCircle = mongoose.model('SocialCircle', socialCircleSchema);
module.exports = SocialCircle;
