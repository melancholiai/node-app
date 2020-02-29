const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const filterSchema = new Schema(
  {
    radius: {
      type: Number,
      ref: 'Radius',
      required: true
    },
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
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
  },
  {
    timestamps: true
  }
);

const Filter = mongoose.model('Filter', filterSchema);
module.exports = Filter;
