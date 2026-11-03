const express = require('express');
const sequelize = require('../config/database');
const redisClient = require('../config/redis');

const router = express.Router();

router.get('/', async (req, res) => {
  const status = { server: 'ok', mysql: 'unknown', redis: 'unknown' };
  let httpStatus = 200;

  try {
    await sequelize.authenticate();
    status.mysql = 'ok';
  } catch (err) {
    status.mysql = 'unreachable';
    httpStatus = 503;
  }

  try {
    await redisClient.ping();
    status.redis = 'ok';
  } catch (err) {
    status.redis = 'unreachable';
    httpStatus = 503;
  }

  res.status(httpStatus).json(status);
});

module.exports = router;
