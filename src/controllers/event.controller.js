const eventService = require('../services/event.service');

function handleServiceError(err, res, next) {
  if (err.message === 'Event not found') return res.status(404).json({ error: err.message });
  if (err.message === 'Forbidden') return res.status(403).json({ error: err.message });
  next(err);
}

async function createEvent(req, res, next) {
  try {
    const event = await eventService.createEvent(req.user.id, req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

async function listEvents(req, res, next) {
  try {
    const events = await eventService.listEvents();
    res.status(200).json(events);
  } catch (err) {
    next(err);
  }
}

async function getEvent(req, res, next) {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json(event);
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

async function updateEvent(req, res, next) {
  try {
    const event = await eventService.updateEvent(req.params.id, req.user.id, req.body);
    res.status(200).json(event);
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

async function cancelEvent(req, res, next) {
  try {
    const event = await eventService.cancelEvent(req.params.id, req.user.id);
    res.status(200).json(event);
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

async function createSeats(req, res, next) {
  try {
    const { labels } = req.body; // e.g. ["A1", "A2", "A3"]
    const seats = await eventService.createSeats(req.params.id, req.user.id, labels);
    res.status(201).json(seats);
  } catch (err) {
    handleServiceError(err, res, next);
  }
}

async function listSeats(req, res, next) {
  try {
    const seats = await eventService.listSeats(req.params.id);
    res.status(200).json(seats);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEvent, listEvents, getEvent, updateEvent,
  cancelEvent, createSeats, listSeats,
};
