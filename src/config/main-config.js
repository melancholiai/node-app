require('dotenv').config();

module.exports = {
  APP_NAME,
  NODE_ENV,
  APP_PORT = 5000,
  APP_HOSTNAME,
  APP_PROTOCOL,
  APP_SECRET,
  APP_HOSTNAME_DOCKER
} = process.env;

module.exports.APP_URL = `${APP_PROTOCOL}://${APP_HOSTNAME_DOCKER}:${APP_PORT}`

// module.exports.IN_PROD = NODE_ENV === 'production';
module.exports.IN_PROD = false;
