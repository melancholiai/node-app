const session = require('express-session');
const Redis = require('ioredis');
const connectRedis = require('connect-redis');

const { REDIS_OPTIONS } = require('../../config/cache-config');

module.exports.createRedisStore = () => {
  const RedisStore = connectRedis(session);

  const { host, port, password } = REDIS_OPTIONS;
  const client = new Redis({
    host,
    port,
    password
  });

  return new RedisStore({ client });
};
