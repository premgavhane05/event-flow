const express = require('express');
const authRoutes = require('./auth.routes');
const eventRoutes = require('./event.routes');
const reservationRoutes = require('./reservation.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/reservations', reservationRoutes);

module.exports = router;
