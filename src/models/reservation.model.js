const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Reservation extends Model {}

Reservation.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  seatId: { type: DataTypes.INTEGER, allowNull: false, field: 'seat_id' },
  userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  expiresAt: { type: DataTypes.DATE, allowNull: true, field: 'expires_at' },
}, {
  sequelize,
  modelName: 'Reservation',
  tableName: 'reservations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Reservation;
