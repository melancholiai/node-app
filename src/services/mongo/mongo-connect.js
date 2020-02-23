const mongoose = require('mongoose');

const { MONGO_URI, MONGO_DATABASENAME } = require('../../config/mongo-config');

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

module.exports.mongoConnect = async () => {
  await mongoose.connect(MONGO_URI, {
    dbName: MONGO_DATABASENAME,
    ...mongoOptions
  });
};
