const express = require('express');

const session = require('./services/express-session/session');
const { authUserRoutes, passwordRoutes } = require('./routes/auth');
const { userRoutes, userAreaRoutes, friendRequestRoutes, blackListRoutes, tagRoutes, socialCircleRoutes } = require('./routes/main');
const { notFound, serverError } = require('./middleware/errors');
const swaggerInit = require('./services/swagger/swagger');

module.exports.createApp = () => {
  const app = express();

  // bodyParser
  app.use(express.json());

  // initializing the cookie session managment
  app.use(session);

  swaggerInit(app, '/api-docs');

  app.use('/auth', authUserRoutes);

  app.use('/auth/password', passwordRoutes);

  app.use('/user', userRoutes);
  
  app.use('/userarea', userAreaRoutes);

  app.use('/userarea/blacklist/', blackListRoutes);
  
  app.use('/friendrequest', friendRequestRoutes);

  app.use('/tag', tagRoutes);

  app.use('/socialcircle', socialCircleRoutes);

  app.use(notFound);

  app.use(serverError);

  return app;
};
