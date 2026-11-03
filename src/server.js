const app = require('./app');
const config = require('./config');
const sequelize = require('./config/database');
const redisClient = require('./config/redis');

// Import all models so Sequelize knows about them before sync.
require('./models/user.model');
require('./models/event.model');
require('./models/seat.model');
require('./models/reservation.model');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected');

    // sync() auto-creates tables from the models above.
    // Fine for this project; a real production app would use
    // migrations instead of sync() so schema changes are tracked.
    await sequelize.sync();
    console.log('Models synced');

    await redisClient.connect();
    console.log('Redis connected');

    app.listen(config.port, () => {
      console.log(`EventFlow listening on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
