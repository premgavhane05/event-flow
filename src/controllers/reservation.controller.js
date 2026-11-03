const reservationService = require('../services/reservation.service');

function handleServiceError(err, res, next) {
  if (err.message === 'Seat not found' || err.message === 'Reservation not found') {
    return res.status(404).json({ error: err.message });
  }
  if (err.message === 'Seat is not available' || err.message === 'Reservation cannot be cancelled') {
    return res.status(409).json({ error: err.message }); // Conflict
  }
  if (err.message === 'Forbidden') {
    return res.status(403).json({ error: err.message });
  }
  next(err);
}

async function createReservation(req, res, next) {
  try {
    const { seatId } = req.body;
    if (!seatId) return res.status(400).json({ error: 'seatId is required' });

    const reservation = await reservationService.holdSeat(seatId, req.user.id);
    res.status(201).json(reservation);
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

async function getReservation(req, res, next) {
  try {
    const reservation = await reservationService.getReservation(req.params.id);
    res.status(200).json(reservation);
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

async function cancelReservation(req, res, next) {
  try {
    const reservation = await reservationService.cancelReservation(req.params.id, req.user.id);
    res.status(200).json(reservation);
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

module.exports = { createReservation, getReservation, cancelReservation };
