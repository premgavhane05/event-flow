const express = require('express');
const eventController = require('../controllers/event.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', eventController.listEvents);
router.get('/:id', eventController.getEvent);
router.get('/:id/seats', eventController.listSeats);

router.post('/', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.createEvent);
router.patch('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.updateEvent);
router.delete('/:id', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.cancelEvent);
router.post('/:id/seats', authenticate, authorize('ORGANIZER', 'ADMIN'), eventController.createSeats);

module.exports = router;
