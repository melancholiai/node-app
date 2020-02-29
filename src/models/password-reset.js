const mongoose = require('mongoose');

const { generatePlainTextToken, buildUrl } = require('../services/cryptography');
const {
  PASSWORD_RESET_BYTES,
  PASSWORD_RESET_TIMEOUT
} = require('../config/auth-config');
const { PasswordResetQueryParams } = require('../models/custom/url-query-params');
const { generateToken } = require('../services/cryptography');

const Schema = mongoose.Schema;
const passwordResetSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser'
    },
    token: {
      type: String,
      required: true
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
  this.token = generatePlainTextToken(PASSWORD_RESET_BYTES);
  return buildUrl(new PasswordResetQueryParams('password/reset', this.user, this.token));
};

passwordResetSchema.methods.isValid = function(token) {
  if (this.used || this.expiredAt < Date.now() || this.token !== token) {
    return false;
  }
  return true;
};

passwordResetSchema.pre('save', function() {
  if (!this.expiredAt) {
    this.expiredAt = new Date(new Date().getTime() + parseInt(PASSWORD_RESET_TIMEOUT));
  }
  this.used = false;
  this.token = generateToken(this.token);
});

const passwordReset = mongoose.model('passwordReset', passwordResetSchema);
module.exports = passwordReset;
