const { createApp } = require('./app');
const {
  APP_URL,
  APP_PORT,
} = require('./config/main-config');
const { mongoConnect } = require('./services/mongo/mongo-connect')
const { createRedisStore } = require('./services/redis/cache');
const elasticSearchClient = require('./services/elasticsearch/elasticsearch-connect');

elasticSearchClient.cluster.health({},function(err,resp,status) {  
  console.log("-- Client Health --",resp);
});

(async () => {
  try {
    await mongoConnect();

    const app = createApp(createRedisStore());

    app.listen({ port: APP_PORT }, () => console.log(APP_URL));
  } catch (error) {
    console.log(error);
  }
})();
