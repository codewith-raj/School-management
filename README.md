# School Management API

Production-ready Node.js + Express + MySQL API for managing schools and listing them by proximity using the Haversine formula.

This project is assignment-compliant and includes both required endpoints:
- `POST /addSchool`
- `GET /listSchools`

It also includes structured MVC architecture, validation, error handling, Swagger docs, and deployment support for Render.

---

## Tech Stack

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- Joi validation
- Swagger (OpenAPI)
- dotenv
- morgan + winston logging
- helmet, cors, express-rate-limit

---

## Features

- Add school with strict payload validation
- List schools sorted by nearest distance from user coordinates
- Haversine distance calculation (manual implementation)
- Assignment alias routes:
  - `POST /addSchool`
  - `GET /listSchools`
- Existing API routes:
  - `POST /api/schools`
  - `GET /api/schools`
  - `GET /api/schools/:id`
- Pagination support in list API (`page`, `limit`)
- Unified API response format
- Global error handling and unknown-route handling
- Swagger docs at `/api-docs`
- Seed script for sample school data

---

## API Response Format

Most endpoints return:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "errors": []
}
```

Health endpoint response:

```json
{
  "status": "OK"
}
```

---

## Project Structure

```text
school-management/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── config.js
│   │   └── swagger.js
│   ├── controllers/
│   │   └── schoolController.js
│   ├── database/
│   │   ├── connection.js
│   │   └── seeders/
│   │       └── schoolSeeder.js
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   ├── notFoundHandler.js
│   │   └── validate.js
│   ├── models/
│   │   └── School.js
│   ├── routes/
│   │   ├── index.js
│   │   └── schoolRoutes.js
│   ├── services/
│   │   └── schoolService.js
│   └── utils/
│       ├── ApiError.js
│       ├── haversine.js
│       ├── logger.js
│       └── responseHelper.js
├── schema.sql
├── setup.js
├── postman_collection.json
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## Database Schema

Required fields for `schools`:
- `id` (Primary Key, Auto Increment)
- `name` (VARCHAR, NOT NULL)
- `address` (VARCHAR, NOT NULL)
- `latitude` (FLOAT, NOT NULL)
- `longitude` (FLOAT, NOT NULL)

Current schema also includes timestamps:
- `created_at`
- `updated_at`

Use:
- `schema.sql` (manual SQL setup), or
- `npm run setup` (automatic setup script)

---

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env` from `.env.example` and update values:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_management_db
DB_USER=root
DB_PASSWORD=your_mysql_password

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
ALLOWED_ORIGINS=*
```

### 3) Initialize DB and seed data

```bash
npm run setup
npm run seed
```

### 4) Start server

```bash
npm run dev
```

or

```bash
npm start
```

---

## API Endpoints

Base URL (local): `http://localhost:3000`

### Assignment endpoints

- `POST /addSchool`
- `GET /listSchools?latitude=28.6139&longitude=77.2090`

### Main API endpoints

- `POST /api/schools`
- `GET /api/schools?latitude=28.6139&longitude=77.2090&page=1&limit=10`
- `GET /api/schools/:id`
- `GET /health`
- `GET /api-docs`

---

## Example Requests

### Add School

`POST /addSchool`

```json
{
  "name": "ABC School",
  "address": "Sector 1, Noida",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

### List Schools by Proximity

`GET /listSchools?latitude=28.6139&longitude=77.2090&page=1&limit=5`

---

## Swagger Documentation

After running the app:

- `http://localhost:3000/api-docs`

Includes:
- `/addSchool`
- `/listSchools`
- `/api/schools`
- `/health`

---

## Postman Collection

Import file:

- `postman_collection.json`

Collection includes assignment endpoints with sample requests/responses:
- `POST /addSchool`
- `GET /listSchools`

Set variable:
- `baseUrl = http://localhost:3000`

---

## Render Deployment Guide

### A) Prepare repository

1. Push this project to GitHub.
2. Ensure `.env` is not committed and `.env.example` is present.

### B) Deploy API on Render

1. Go to [Render](https://render.com) and create a **Web Service**.
2. Connect your GitHub repository.
3. Configure:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set environment variables in Render dashboard:
   - `NODE_ENV=production`
   - `PORT=10000` (or let Render provide `PORT`)
   - `DB_HOST=...`
   - `DB_PORT=3306`
   - `DB_NAME=...`
   - `DB_USER=...`
   - `DB_PASSWORD=...`
   - `RATE_LIMIT_WINDOW_MS=900000`
   - `RATE_LIMIT_MAX=100`
   - `LOG_LEVEL=info`
   - `ALLOWED_ORIGINS=*` (or your frontend domain)

### C) MySQL hosting options

Render does not provide native MySQL in all plans, so use one of:
- Railway MySQL
- PlanetScale
- Clever Cloud MySQL

Copy those DB credentials into Render environment variables.

### D) Verify after deployment

Use your Render URL:
- `https://your-app.onrender.com/health`
- `https://your-app.onrender.com/addSchool`
- `https://your-app.onrender.com/listSchools?latitude=28.6139&longitude=77.2090`
- `https://your-app.onrender.com/api-docs`

---

## Production Notes

- Uses security middleware (`helmet`, `cors`, rate limiting)
- Uses centralized error handling
- Uses structured logging
- Uses environment-driven configuration
- Uses Sequelize ORM and validation layering (Joi + model checks)

---

## License

MIT
