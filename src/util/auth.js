const { Unauthorized } = require('../errors');
const AuthUser = require('../models/auth-user');
const { SESSION_OPTIONS } = require('../config/cache-config');

module.exports.isLoggedIn = req => {
  if (req.session) {
    if (req.session.authUserId) {
      return true;
    }
  }
  return false;
};

module.exports.attemptLogin = (req, authUserId) => {
  if (req.session) {
    req.session.authUserId = authUserId;
    return true;
  }
  return false;
};

module.exports.attemptSignIn = async (email, password) => {
  const user = await AuthUser.findOne({ email });
  if (!user) {
    throw new Unauthorized('Invalid credentials.');
  }

  if (!(await user.matchesPassword(password))) {
    throw new Unauthorized('Invalid credentials.');
  }

  if (!user.verifiedAt) {
    throw new Unauthorized('Please activate your account first.');
  }
  return user;
};

module.exports.attemptRegister = async (email, username) => {
  const userWithEmail = await AuthUser.findOne({ email });
  if (userWithEmail) {
    throw new Unauthorized('Email is already taken.');
  }

  const userWithUsername = await AuthUser.findOne({ username });
  if (userWithUsername) {
    throw new Unauthorized('Username is already taken.');
  }

  return true;
};

// creating a promise that if resolved will destroy the session and remove the cookie
module.exports.attemptSignOut = async (req, res) =>
  new Promise((resolve, reject) => {
    req.session.destroy(err => {
      if (err) reject(err);
      res.clearCookie(SESSION_OPTIONS.name);
      resolve(true);
    });
  });
