'use strict';

require('dotenv').config();
const app = require('./app');
const { connectDatabase } = require('./database/connection');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DB_RETRY_DELAY_MS = parseInt(process.env.DB_RETRY_DELAY_MS, 10) || 5000;
const DB_MAX_RETRIES = parseInt(process.env.DB_MAX_RETRIES, 10) || 12;

const TRANSIENT_DB_ERROR_CODES = new Set([
  'EAI_AGAIN',
  'ETIMEDOUT',
  'ECONNRESET',
  'PROTOCOL_CONNECTION_LOST',
  'ECONNREFUSED',
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectDatabaseWithRetry() {
  for (let attempt = 1; attempt <= DB_MAX_RETRIES; attempt++) {
    try {
      await connectDatabase();
      return;
    } catch (err) {
      const code = err?.original?.code || err?.parent?.code || err?.code || 'UNKNOWN';
      const isTransient = TRANSIENT_DB_ERROR_CODES.has(code);
      const isLastAttempt = attempt === DB_MAX_RETRIES;

      logger.error(
        `Database connection attempt ${attempt}/${DB_MAX_RETRIES} failed (code: ${code}).`
      );

      if (!isTransient || isLastAttempt) {
        throw err;
      }

      logger.info(`Retrying database connection in ${DB_RETRY_DELAY_MS}ms...`);
      await sleep(DB_RETRY_DELAY_MS);
    }
  }
}

/**
 * Graceful startup: connect DB first, then start HTTP server.
 */
async function startServer() {
  try {
    // 1. Establish database connection & sync models (with retry for cloud DNS/network hiccups)
    await connectDatabaseWithRetry();

    // 2. Start HTTP server
    const server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 School Management API is running`);
      logger.info(`   • Environment : ${process.env.NODE_ENV}`);
      logger.info(`   • Host        : ${HOST}`);
      logger.info(`   • Port        : ${PORT}`);
      logger.info(`   • API Base    : http://localhost:${PORT}/api`);
      logger.info(`   • Swagger     : http://localhost:${PORT}/api-docs`);
      logger.info(`   • Health      : http://localhost:${PORT}/health`);
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
