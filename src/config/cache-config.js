const { IN_PROD } = require('./main-config');

const HALF_HOUR = 1000 * 60 * 30;

const {
  REDIS_HOST,
  REDIS_HOST_DOCKER,
  REDIS_PORT,
  REDIS_PORT_DOCKER,
  REDIS_PASSWORD,
  SESS_NAME,
  SESS_SECRET,
  SESS_LIFETIME = HALF_HOUR
} = process.env;

module.exports.REDIS_OPTIONS = {
  host: REDIS_HOST_DOCKER,
  port: +REDIS_PORT_DOCKER,
  password: REDIS_PASSWORD
};

module.exports.SESSION_OPTIONS = {
  name: SESS_NAME,
  secret: SESS_SECRET,
  lifetime: +SESS_LIFETIME,
  secure: IN_PROD
};