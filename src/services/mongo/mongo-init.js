const { MONGO_DATABASENAME, MONGO_USERNAME, MONGO_PASSWORD} = require('../../config/mongo-config');

db.createUser({
  user: MONGO_USERNAME,
  pwd: MONGO_PASSWORD,
  roles: [
    {
      role: 'readWrite',
      db: MONGO_DATABASENAME
    }
  ]
});
