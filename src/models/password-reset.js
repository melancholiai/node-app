const mongoose = require('mongoose');

const { generatePlainTextToken, buildUrl } = require('../services/cryptography');
const {
  PASSWORD_RESET_BYTES,
  PASSWORD_RESET_TIMEOUT
} = require('../config/auth-config');
const { PasswordResetQueryParams } = require('../models/custom/url-query-params');

const Schema = mongoose.Schema;

const passwordResetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser'
    },
    expiredAt: {
      type: Date
    },
    used: {
      type: Boolean
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

passwordResetSchema.methods.createResetPasswordUrl = function() {
  const plainTextToken = generatePlainTextToken(PASSWORD_RESET_BYTES);
  return buildUrl(new PasswordResetQueryParams('password/reset', this.userId, plainTextToken));
};

passwordResetSchema.methods.isValid = function() {
  if (this.used || this.expiredAt < Date.now()) {
    return false;
  }
  return true;
};

passwordResetSchema.pre('save', function() {
  if (!this.expiredAt) {
    this.expiredAt = new Date(new Date().getTime() + parseInt(PASSWORD_RESET_TIMEOUT));
  }
  this.used = false;
});

const passwordReset = mongoose.model('passwordReset', passwordResetSchema);
module.exports = passwordReset;
