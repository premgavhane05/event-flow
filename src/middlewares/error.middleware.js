// Centralized error handler — catches anything passed to next(err)
// so we don't scatter try/catch response-shaping everywhere.
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
