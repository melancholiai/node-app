const express = require('express');

const session = require('./services/express-session/session');
const { authUser, password } = require('./routes/auth');
const { user, friendRequest, blackList, tags, socialCircle } = require('./routes/main');
const { notFound, serverError } = require('./middleware/errors');
const swaggerInit = require('./services/swagger');

module.exports.createApp = () => {
  const app = express();

  // bodyParser
  app.use(express.json());

  // initializing the cookie session managment
  app.use(session);

  swaggerInit(app, '/api-docs');

  app.use('/auth', authUser);

  app.use('/auth/password', password);

  app.use('/user', user);

  app.use('/friendrequest', friendRequest);

  app.use('/user/me/blacklist/', blackList);

  app.use('/tags', tags);

  app.use('/socialcircle', socialCircle);

  app.use(notFound);

  app.use(serverError);

  return app;
};
