const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Seat extends Model {}

Seat.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  eventId: { type: DataTypes.INTEGER, allowNull: false, field: 'event_id' },
  label: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM('AVAILABLE', 'HELD', 'BOOKED'),
    allowNull: false,
    defaultValue: 'AVAILABLE',
  },
  heldByUserId: { type: DataTypes.INTEGER, allowNull: true, field: 'held_by_user_id' },
  heldUntil: { type: DataTypes.DATE, allowNull: true, field: 'held_until' },
}, {
  sequelize,
  modelName: 'Seat',
  tableName: 'seats',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['event_id', 'label'] },
  ],
});

module.exports = Seat;
