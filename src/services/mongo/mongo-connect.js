const mongoose = require('mongoose');

const { MONGO_URI, MONGO_DATABASENAME, MONGO_URI_DOCKER } = require('../../config/mongo-config');

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
};

module.exports.mongoConnect = async () => {
  // await mongoose.connect(MONGO_URI_DOCKER, {
  //   dbName: MONGO_DATABASENAME,
  //   ...mongoOptions
  // });
  await mongoose.connect(MONGO_URI_DOCKER, mongoOptions);
};
