'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { swaggerSpec, swaggerUI } = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');
const logger = require('./utils/logger');

const app = express();

// ─────────────────────────────────────────────
// 1. Security middleware
// ─────────────────────────────────────────────
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['*'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
  })
);

// ─────────────────────────────────────────────
// 2. Rate limiting
// ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    data: null,
  },
});

app.use('/api', limiter);

// ─────────────────────────────────────────────
// 3. Request parsing & compression
// ─────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ─────────────────────────────────────────────
// 4. HTTP request logging (morgan → winston)
// ─────────────────────────────────────────────
const morganMiddleware = morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
  skip: () => process.env.NODE_ENV === 'test',
});

app.use(morganMiddleware);

// ─────────────────────────────────────────────
// 5. Health-check route (unauthenticated)
// ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'School Management API is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: require('../package.json').version,
    },
  });
});

// ─────────────────────────────────────────────
// 6. Swagger API docs
// ─────────────────────────────────────────────
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// ─────────────────────────────────────────────
// 7. API routes
// ─────────────────────────────────────────────
app.use('/api', routes);

// ─────────────────────────────────────────────
// 8. 404 + global error handlers
// ─────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
