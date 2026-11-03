const express = require('express');
const routes = require('./routes');
const healthRoutes = require('./routes/health.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.use(express.json());

// Health check is root-level, outside API versioning —
// infra/load-balancer concern, not a versioned business endpoint.
app.use('/health', healthRoutes);

app.use('/api/v1', routes);

// Must be registered last — Express identifies error handlers
// by their 4-argument signature (err, req, res, next).
app.use(errorHandler);

module.exports = app;
