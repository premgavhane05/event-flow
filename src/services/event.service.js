const Event = require('../models/event.model');
const Seat = require('../models/seat.model');

async function createEvent(organizerId, { title, description, venue, startsAt }) {
  return Event.create({ organizerId, title, description, venue, startsAt, status: 'DRAFT' });
}

async function listEvents() {
  return Event.findAll({ where: { status: 'PUBLISHED' } });
}

async function getEventById(id) {
  const event = await Event.findByPk(id);
  if (!event) throw new Error('Event not found');
  return event;
}

async function updateEvent(eventId, organizerId, updates) {
  const event = await Event.findByPk(eventId);
  if (!event) throw new Error('Event not found');
  if (event.organizerId !== organizerId) throw new Error('Forbidden');

  await event.update(updates);
  return event;
}

async function cancelEvent(eventId, organizerId) {
  const event = await Event.findByPk(eventId);
  if (!event) throw new Error('Event not found');
  if (event.organizerId !== organizerId) throw new Error('Forbidden');

  event.status = 'CANCELLED';
  await event.save();
  return event;
}

// Bulk-create seats, e.g. labels: ["A1", "A2", "A3"]
async function createSeats(eventId, organizerId, labels) {
  const event = await Event.findByPk(eventId);
  if (!event) throw new Error('Event not found');
  if (event.organizerId !== organizerId) throw new Error('Forbidden');

  const seatRows = labels.map((label) => ({ eventId, label, status: 'AVAILABLE' }));
  return Seat.bulkCreate(seatRows);
}

async function listSeats(eventId) {
  return Seat.findAll({ where: { eventId } });
}

module.exports = {
  createEvent, listEvents, getEventById,
  updateEvent, cancelEvent, createSeats, listSeats,
};
