const mongoose = require('mongoose');
const { hash, compare } = require('bcryptjs');

const { buildUrl, hashPassword } = require('../services/cryptography');
const { BCRYPT_HASH_ROUNDS } = require('../config/auth-config');
const { VerifyPasswordQueryParams } = require('./custom/url-query-params');

const Schema = mongoose.Schema;

const authUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: async email => AuthUser.doesntExist({ email }),
        // TODO: security
        message: ({ value }) => `Email ${value} is already in use`
      }
    },
    username: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: username => AuthUser.doesntExist({ username }),
        // TODO: security
        message: ({ value }) => `Username ${value} is already in use`
      }
    },
    name: {
      type: String,
      required: true
    },
    password: {
      type: String,
      minlength: 6
    },
    verifiedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

/*in this function we'll keep the pre ES6 function call to have the 'this' keyword
  representing the current user object and not the outer scope */
authUserSchema.pre('save', async function() {
  if (this.isModified('password')) {
    await this.changePassword(this.password);
  }
});

// a static method for the scheme, checks if a given option already exists in one of the previous docs
authUserSchema.statics.doesntExist = async function(options) {
  return (await this.where(options).countDocuments()) === 0;
};

authUserSchema.methods.matchesPassword = function(password) {
  return compare(hashPassword(password), this.password);
};

authUserSchema.methods.createVerificationUrl = function() {
  return buildUrl(new VerifyPasswordQueryParams('verify', this.id, this.email));
};

authUserSchema.methods.changePassword = async function(newPassword) {
  // bcrypt can work on streams long as 72 bits thus creating an sha256 hash will turn any length to 44 bit
  const hashedPassword = hashPassword(newPassword);
  // hash using bcrypt
  this.password = await hash(hashedPassword, parseInt(BCRYPT_HASH_ROUNDS));
};

// when parsing to json remove the "__v" and "password" fields
authUserSchema.set('toJSON', {
  transform: (doc, { __v, password, ...rest }, options) => rest
});

const AuthUser = mongoose.model('AuthUser', authUserSchema);
module.exports = AuthUser;
