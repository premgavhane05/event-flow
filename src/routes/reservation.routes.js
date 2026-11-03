const express = require('express');
const reservationController = require('../controllers/reservation.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authenticate, reservationController.createReservation);
router.get('/:id', authenticate, reservationController.getReservation);
router.delete('/:id', authenticate, reservationController.cancelReservation);

module.exports = router;
