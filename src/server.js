'use strict';

require('dotenv').config();
const app = require('./app');
const { connectDatabase } = require('./database/connection');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

/**
 * Graceful startup: connect DB first, then start HTTP server.
 */
async function startServer() {
  try {
    // 1. Establish database connection & sync models
    await connectDatabase();

    // 2. Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 School Management API is running`);
      logger.info(`   • Environment : ${process.env.NODE_ENV}`);
      logger.info(`   • Port        : ${PORT}`);
      logger.info(`   • API Base    : http://localhost:${PORT}/api`);
      logger.info(`   • Swagger     : http://localhost:${PORT}/api-docs`);
    });

    // 3. Graceful shutdown handlers
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully…`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // 4. Unhandled rejections / exceptions
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
