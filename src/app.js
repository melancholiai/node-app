const express = require('express');
const session = require('express-session');

const { SESSION_OPTIONS } = require('./config/cache-config');
const { user, password } = require('./routes/auth');
const { notFound, serverError } = require('./middleware/errors');
const swaggerInit = require('./services/swagger');

module.exports.createApp = store => {
  const app = express();

  // bodyParser
  app.use(express.json());

  const { name, secret, maxAge, secure } = SESSION_OPTIONS;

  // initializing the cookie session managment
  app.use(
    session({
      store,
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
    })
  );

  swaggerInit(app, '/api-docs');

  app.use('/auth', user);

  app.use('/auth/password', password);

  app.use(notFound);

  app.use(serverError);

  return app;
};
