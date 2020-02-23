const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_CLUSTER,
  MONGO_PORT,
  MONGO_DATABASENAME
} = process.env;

module.exports.MONGO_URI = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(
  MONGO_PASSWORD
)}@${MONGO_CLUSTER}-shard-00-00-eudxc.mongodb.net:${MONGO_PORT},${MONGO_CLUSTER}-shard-00-01-eudxc.mongodb.net:${MONGO_PORT},${MONGO_CLUSTER}-shard-00-02-eudxc.mongodb.net:${MONGO_PORT}/test?ssl=true&replicaSet=${MONGO_CLUSTER}-shard-0&authSource=${MONGO_USERNAME}&retryWrites=true&w=majority`;

module.exports.MONGO_DATABASENAME = MONGO_DATABASENAME
