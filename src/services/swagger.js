const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const { APP_NAME, APP_PORT } = require('../config/main-config');

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: APP_NAME,
      description:
        'a simple chat app using nodejs, angular, mongo, redis, elasticsearch, graphql and docker'
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = (app, endpoint) => {
  app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use(endpoint, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
