const { AuthenticationError } = require('apollo-server-express');

const { SESSION_OPTIONS } = require('../config/cache-config');
const AuthUser = require('../models/auth-user');

module.exports.checkSignedIn = req => {
  if (!req.session.authUserId) {
    throw new AuthenticationError('Unauthorized. Client must be signed in.');
  }
};

module.exports.checkSignedOut = req => {
  if (req.session.authUserId) {
    throw new AuthenticationError('Unauthorized. Client must be signed out.');
  }
};

module.exports.attemptSignIn = async (email, password) => {
  const user = await AuthUser.findOne({ email });

  // couldn't find a user with this email
  if (!user) {
    throw new AuthenticationError('Invalid credentials.');
  }

  // wrong password
  if (!(await user.matchesPassword(password))) {
    throw new AuthenticationError('Invalid credentials.');
  }

  return user;
};

// creating a promise that if resolved will destroy the session and remove the cookie
module.exports.attemptSignOut = (req, res) =>
  new Promise((resolve, reject) => {
    req.session.destroy(err => {
      if (err) reject(err);
      res.clearCookie(SESSION_OPTIONS.name);
      resolve(true);
    });
  });
