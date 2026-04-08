'use strict';

const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Singleton Sequelize instance shared across the entire application.
 */
const sequelizeOptions = {
  dialect: config.database.dialect,
  pool: config.database.pool,
  logging: config.database.logging,
  dialectOptions: config.database.dialectOptions,
  define: {
    underscored: false,       // use camelCase in JS, but Sequelize maps to snake via field options
    freezeTableName: false,   // allows Sequelize to pluralise
    timestamps: true,
  },
};

const sequelize = config.database.url
  ? new Sequelize(config.database.url, sequelizeOptions)
  : new Sequelize(
      config.database.name,
      config.database.username,
      config.database.password,
      {
        ...sequelizeOptions,
        host: config.database.host,
        port: config.database.port,
      }
    );

/**
 * connectDatabase — authenticates + syncs all models.
 * Called once at startup from server.js.
 */
async function connectDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('✅ MySQL database connection established successfully.');

    // In production, use migrations instead of sync({ alter: true })
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database models synchronised (alter mode).');
    } else {
      await sequelize.sync();
      logger.info('✅ Database models synchronised.');
    }
  } catch (error) {
    logger.error(`❌ Unable to connect to database: ${error.message}`);
    throw error;
  }
}

module.exports = { sequelize, connectDatabase };
