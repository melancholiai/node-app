const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const session = require('express-session');

const { SESS_NAME, SESS_SECRET, SESS_LIFETIME } = require('./config/main-config');
const typeDefs = require('./graphql/typeDefs/index');
const resolvers = require('./graphql/resolvers/index');
const schemaDirectives = require('./graphql/directives/index');

module.exports.createGraphqlApp = store => {
  const app = express();
  // remvoe header
  app.disable('x-powered-by');

  // initializing the cookie session managment
  app.use(
    session({
      store,
      name: SESS_NAME,
      secret: SESS_SECRET,
      resave: true, // update the ttl on the session - done automaticly by redis
      rolling: true, // extend session lifetime on every request
      saveUninitialized: false,
      cookie: {
        maxAge: parseInt(SESS_LIFETIME),
        sameSite: true,
        secure: false
      }
    })
  );

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives,
    // the graphQL playground in development set to true with settings, in prod false
    playground: {
      settings: {
        'request.credentials': 'include'
      }
    },
    // configuring the context to be available along the pipeline
    context: ({ req, res }) => ({ req, res })
  });

  server.applyMiddleware({ app });

  return app;
};
