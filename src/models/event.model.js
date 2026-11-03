const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Event extends Model {}

Event.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  organizerId: { type: DataTypes.INTEGER, allowNull: false, field: 'organizer_id' },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  venue: { type: DataTypes.STRING },
  startsAt: { type: DataTypes.DATE, field: 'starts_at' },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'DRAFT',
  },
}, {
  sequelize,
  modelName: 'Event',
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Event;
