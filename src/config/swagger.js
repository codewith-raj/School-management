'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management API',
      version: '1.0.0',
      description: `
## 🏫 School Management REST API

A production-grade RESTful API for managing school records with **geolocation-based sorting**.

### Features
- Add schools with geolocation (latitude / longitude)
- List all schools sorted by proximity to a given coordinate (Haversine formula)
- Full input validation via **Joi**
- Rate limiting, CORS, Helmet security headers
- Structured JSON responses

### Response Format
\`\`\`json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
\`\`\`
      `,
      contact: {
        name: 'API Support',
        email: 'support@schoolmgmt.api',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development Server',
      },
      {
        url: 'https://your-app.onrender.com',
        description: 'Production Server (Render)',
      },
    ],
    tags: [
      {
        name: 'Schools',
        description: 'School management endpoints',
      },
      {
        name: 'Health',
        description: 'API health & uptime',
      },
    ],
    components: {
      schemas: {
        School: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Delhi Public School' },
            address: { type: 'string', example: '15 Ring Road, New Delhi 110001' },
            latitude: { type: 'number', format: 'float', example: 28.6139 },
            longitude: { type: 'number', format: 'float', example: 77.2090 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SchoolWithDistance: {
          allOf: [
            { $ref: '#/components/schemas/School' },
            {
              type: 'object',
              properties: {
                distance: {
                  type: 'number',
                  format: 'float',
                  example: 2.34,
                  description: 'Distance from the query point in kilometres',
                },
              },
            },
          ],
        },
        CreateSchoolBody: {
          type: 'object',
          required: ['name', 'address', 'latitude', 'longitude'],
          properties: {
            name: { type: 'string', example: 'Delhi Public School' },
            address: { type: 'string', example: '15 Ring Road, New Delhi 110001' },
            latitude: { type: 'number', format: 'float', example: 28.6139 },
            longitude: { type: 'number', format: 'float', example: 77.2090 },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            data: { type: 'null', example: null },
            errors: {
              type: 'array',
              items: { type: 'string' },
              example: ['name is required', 'latitude must be between -90 and 90'],
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec, swaggerUI };
