'use strict';

const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../database/connection');

/**
 * @swagger
 * components:
 *   schemas:
 *     School:
 *       $ref: '#/components/schemas/School'
 */

/**
 * School model — maps to the `schools` table in MySQL.
 *
 * Columns:
 *   id          – PK, auto-increment
 *   name        – School name (non-empty string)
 *   address     – Full address string
 *   latitude    – Latitude  (-90  to  90)
 *   longitude   – Longitude (-180 to 180)
 *   created_at  – Auto-managed by Sequelize
 *   updated_at  – Auto-managed by Sequelize
 */
class School extends Model {
  /**
   * Returns a plain-object representation safe for API responses.
   */
  toJSON() {
    const values = super.toJSON();
    return values;
  }
}

School.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'School name cannot be empty.' },
        len: { args: [2, 255], msg: 'School name must be between 2 and 255 characters.' },
      },
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address cannot be empty.' },
        len: { args: [5, 500], msg: 'Address must be between 5 and 500 characters.' },
      },
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: { msg: 'Latitude must be a valid floating-point number.' },
        min: { args: [-90], msg: 'Latitude must be >= -90.' },
        max: { args: [90], msg: 'Latitude must be <= 90.' },
      },
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: { msg: 'Longitude must be a valid floating-point number.' },
        min: { args: [-180], msg: 'Longitude must be >= -180.' },
        max: { args: [180], msg: 'Longitude must be <= 180.' },
      },
    },
  },
  {
    sequelize,
    modelName: 'School',
    tableName: 'schools',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: false,    // keep camelCase column names in JS
    indexes: [
      {
        // Composite index for location-based queries
        name: 'idx_schools_location',
        fields: ['latitude', 'longitude'],
      },
      {
        name: 'idx_schools_name',
        fields: ['name'],
      },
    ],
  }
);

module.exports = School;
