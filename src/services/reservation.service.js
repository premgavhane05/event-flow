const sequelize = require('../config/database');
const Seat = require('../models/seat.model');
const Reservation = require('../models/reservation.model');

const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// The core concurrency-safe operation: only one caller can ever
// successfully hold a given seat, even under simultaneous requests.
async function holdSeat(seatId, userId) {
  return sequelize.transaction(async (t) => {
    // SELECT ... FOR UPDATE — takes an exclusive row lock on this seat.
    // Any other transaction trying to lock the same row blocks here
    // until this transaction commits or rolls back.
    const seat = await Seat.findByPk(seatId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!seat) {
      throw new Error('Seat not found');
    }

    if (seat.status !== 'AVAILABLE') {
      throw new Error('Seat is not available');
    }

    seat.status = 'HELD';
    seat.heldByUserId = userId;
    seat.heldUntil = new Date(Date.now() + HOLD_DURATION_MS);
    await seat.save({ transaction: t });

    const reservation = await Reservation.create({
      seatId: seat.id,
      userId,
      status: 'PENDING',
      expiresAt: seat.heldUntil,
    }, { transaction: t });

    return reservation;
  });
}

async function getReservation(id) {
  const reservation = await Reservation.findByPk(id);
  if (!reservation) throw new Error('Reservation not found');
  return reservation;
}

// Cancel a PENDING hold, releasing the seat back to AVAILABLE.
async function cancelReservation(reservationId, userId) {
  return sequelize.transaction(async (t) => {
    const reservation = await Reservation.findByPk(reservationId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!reservation) throw new Error('Reservation not found');
    if (reservation.userId !== userId) throw new Error('Forbidden');
    if (reservation.status !== 'PENDING') throw new Error('Reservation cannot be cancelled');

    const seat = await Seat.findByPk(reservation.seatId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    seat.status = 'AVAILABLE';
    seat.heldByUserId = null;
    seat.heldUntil = null;
    await seat.save({ transaction: t });

    reservation.status = 'CANCELLED';
    await reservation.save({ transaction: t });

    return reservation;
  });
}

module.exports = { holdSeat, getReservation, cancelReservation };
