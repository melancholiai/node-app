const session = require('express-session');

const { createRedisStore } = require('../redis/cache');
const { SESSION_OPTIONS } = require('../../config/cache-config');
const { name, secret, maxAge, secure } = SESSION_OPTIONS;

module.exports = session({
  store: createRedisStore(),
  name,
  secret,
  resave: false, // update the ttl on the session - done automaticly by redis
  rolling: true, // extend session lifetime on every request
  saveUninitialized: false,
  cookie: {
    maxAge,
    sameSite: true,
    //FIXME: should be secure boolean which is IN_PROD
    secure: false
  }
});
