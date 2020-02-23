const { generateToken } = require('../../services/cryptography');
const queryString = require('query-string');
const {
    EMAIL_VERIFICATION_TIMEOUT
  } = require('../../config/auth-config');

class UrlQueryParams {
  constructor(type, id) {
    this.type = type;
    this.id = id;
  }
  getStringUrl() {
    const { type, ...meta } = this;
    return queryString.stringify(meta);
  }
}

module.exports.PasswordResetQueryParams = class PasswordResetQueryParams extends UrlQueryParams {
  constructor(type, id, data) {
    super(type, id);
    this.token = generateToken(data);
  }
};

module.exports.VerifyPasswordQueryParams = class VerifyPasswordQueryParams extends UrlQueryParams {
  constructor(type, id, data) {
    super(type, id);
    this.token = generateToken(data);
    this.expires = Date.now() + parseInt(EMAIL_VERIFICATION_TIMEOUT);
  }
};