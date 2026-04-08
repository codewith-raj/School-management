'use strict';

require('dotenv').config();

/**
 * Central application configuration.
 * All config is read from environment variables — never hard-coded.
 */
const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.DB_NAME || 'school_management_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // Needed for Railway / PlanetScale hosted MySQL
      ssl: process.env.DATABASE_URL
        ? { require: true, rejectUnauthorized: false }
        : process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: true }
          : false,
    },
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900_000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = config;
