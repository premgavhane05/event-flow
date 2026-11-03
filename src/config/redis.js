const { createClient } = require('redis');
const config = require('./index');

const redisClient = createClient({ url: config.redis.url });

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

module.exports = redisClient;
