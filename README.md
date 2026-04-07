# 🏫 School Management API

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey?logo=express)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)](https://mysql.com)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-blue?logo=sequelize)](https://sequelize.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A **production-grade**, **resume-worthy** REST API for managing school records with real-time geolocation sorting using the **Haversine formula**. Built with clean MVC architecture, full input validation, structured logging, rate limiting, Swagger docs, and Docker support.

---

## 📁 Project Structure

```
school-management/
├── src/
│   ├── server.js                # Entry point — graceful startup
│   ├── app.js                   # Express app — middleware pipeline
│   ├── config/
│   │   ├── config.js            # Centralised env-var config
│   │   └── swagger.js           # OpenAPI 3.0 spec
│   ├── database/
│   │   ├── connection.js        # Sequelize singleton + connectDatabase()
│   │   └── seeders/
│   │       └── schoolSeeder.js  # Seed 10 real schools (idempotent)
│   ├── models/
│   │   └── School.js            # Sequelize model with validations + indexes
│   ├── controllers/
│   │   └── schoolController.js  # Thin HTTP layer — delegates to service
│   ├── services/
│   │   └── schoolService.js     # Business logic — DB ops + distance calc
│   ├── routes/
│   │   ├── index.js             # Root router
│   │   └── schoolRoutes.js      # /api/schools routes
│   ├── middlewares/
│   │   ├── validate.js          # Joi validation middleware
│   │   ├── errorHandler.js      # Global error handler (4 params)
│   │   └── notFoundHandler.js   # 404 catcher
│   └── utils/
│       ├── haversine.js         # Pure Haversine formula (no external API)
│       ├── logger.js            # Winston logger (console + rotating files)
│       ├── responseHelper.js    # Standardised JSON response envelope
│       └── ApiError.js          # Custom operational error class
├── schema.sql                   # Raw SQL schema (create DB + table)
├── postman_collection.json      # Ready-to-import Postman collection
├── Dockerfile                   # Multi-stage production Docker image
├── docker-compose.yml           # Full stack: MySQL + API
├── vercel.json                  # Vercel serverless config
├── .env.example                 # Environment variable template
├── .gitignore
└── package.json
```

---

## ✨ Features

| Feature | Implementation |
|---|---|
| **MVC Architecture** | Routes → Controllers → Services → Models |
| **Input Validation** | Joi schemas — body & query params |
| **Distance Sorting** | Haversine formula (pure JS, no external API) |
| **Error Handling** | Global middleware, custom `ApiError` class |
| **Logging** | Winston + Morgan (console + rotating file) |
| **Security** | Helmet, CORS, Rate Limiting |
| **API Docs** | Swagger UI at `/api-docs` |
| **Database** | MySQL 8 via Sequelize ORM with indexes |
| **Docker** | Multi-stage Dockerfile + Docker Compose |
| **Seed Data** | 10 real Indian schools, idempotent |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MySQL 8.0 (local or cloud)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/school-management-api.git
cd school-management-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=school_management_db
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### 3. Create the Database

```bash
# Connect to MySQL and run the schema
mysql -u root -p < schema.sql
```

Or paste the contents of `schema.sql` into MySQL Workbench / DBeaver.

### 4. Run the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

### 5. Seed Sample Data (Optional)

```bash
npm run seed
# Inserts 10 real Indian schools. Idempotent — safe to run multiple times.
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check + uptime |
| `POST` | `/api/schools` | Add a new school |
| `GET` | `/api/schools?latitude=X&longitude=Y` | List schools sorted by distance |
| `GET` | `/api/schools/:id` | Get single school by ID |
| `GET` | `/api-docs` | Swagger interactive documentation |

---

## 📋 API Reference

### POST `/api/schools` — Add School

**Request Body:**
```json
{
  "name": "Delhi Public School",
  "address": "15 Ring Road, New Delhi, Delhi 110001",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| `name` | Required, string, 2–255 chars |
| `address` | Required, string, 5–500 chars |
| `latitude` | Required, float, -90 to 90 |
| `longitude` | Required, float, -180 to 180 |

**Success Response `201`:**
```json
{
  "success": true,
  "message": "School added successfully.",
  "data": {
    "id": 1,
    "name": "Delhi Public School",
    "address": "15 Ring Road, New Delhi, Delhi 110001",
    "latitude": 28.6139,
    "longitude": 77.209,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Validation Error `400`:**
```json
{
  "success": false,
  "message": "Validation failed.",
  "data": null,
  "errors": [
    "name is required.",
    "latitude must be <= 90."
  ]
}
```

---

### GET `/api/schools?latitude=X&longitude=Y` — List Schools

**Query Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `latitude` | float | ✅ Yes | Your latitude (-90 to 90) |
| `longitude` | float | ✅ Yes | Your longitude (-180 to 180) |

**Example Request:**
```
GET /api/schools?latitude=28.6139&longitude=77.2090
```

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Schools retrieved and sorted by distance.",
  "data": {
    "totalCount": 3,
    "userLocation": {
      "latitude": 28.6139,
      "longitude": 77.209
    },
    "schools": [
      {
        "id": 1,
        "name": "Delhi Public School",
        "address": "15 Ring Road, New Delhi, Delhi 110001",
        "latitude": 28.6139,
        "longitude": 77.209,
        "distance": 0,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 3,
        "name": "The Doon School",
        "address": "Mall Road, Dehradun, Uttarakhand 248001",
        "latitude": 30.3256,
        "longitude": 78.0335,
        "distance": 198.42,
        "createdAt": "2024-01-15T10:32:00.000Z",
        "updatedAt": "2024-01-15T10:32:00.000Z"
      }
    ]
  }
}
```

> `distance` is in **kilometres**, calculated using the **Haversine formula**.

---

## 🗄️ Database Schema

```sql
CREATE TABLE schools (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(255) NOT NULL,
  address    VARCHAR(500) NOT NULL,
  latitude   FLOAT        NOT NULL,
  longitude  FLOAT        NOT NULL,
  createdAt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_schools_location (latitude, longitude),
  INDEX idx_schools_name     (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🐳 Docker

### Run with Docker Compose (recommended)

```bash
# Builds API image + spins up MySQL container
docker-compose up --build

# Run in background
docker-compose up --build -d

# Stop
docker-compose down

# Stop and remove volumes (wipe DB)
docker-compose down -v
```

### Build image only

```bash
docker build -t school-mgmt-api .
docker run -p 3000:3000 --env-file .env school-mgmt-api
```

---

## ☁️ Deployment

### Option A — Render.com (Recommended Free Tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add all environment variables from `.env.example`
6. Deploy!

**MySQL on Render:**
- Create a new **PostgreSQL** service (free) OR use Railway/PlanetScale for MySQL

---

### Option B — Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Add MySQL plugin from Railway dashboard

# Deploy
railway up
```

Set env vars in Railway dashboard → Variables tab.

---

### Option C — PlanetScale (Managed MySQL)

1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a database → Get connection string
3. Update `.env`:
   ```env
   DB_HOST=aws.connect.psdb.cloud
   DB_NAME=your-db-name
   DB_USER=your-username
   DB_PASSWORD=pscale_pw_xxx
   NODE_ENV=production
   ```
4. Deploy server to Render/Railway with these env vars

---

## 📬 Postman Collection

Import `postman_collection.json` into Postman:

1. Open Postman → **Import** → Upload File
2. Select `postman_collection.json`
3. Set the `baseUrl` variable to `http://localhost:3000`
4. All requests with example responses are ready to use

---

## 🔬 Haversine Formula

The distance between two points on Earth is calculated without any external API:

```
a = sin²(Δlat/2) + cos(lat1) · cos(lat2) · sin²(Δlon/2)
c = 2 · atan2(√a, √(1−a))
d = R · c        where R = 6371 km
```

Implementation: [`src/utils/haversine.js`](src/utils/haversine.js)

---

## 🛡️ Security

| Layer | Implementation |
|-------|----------------|
| HTTP Security Headers | `helmet` |
| CORS | Configurable via `ALLOWED_ORIGINS` |
| Rate Limiting | 100 req / 15 min per IP |
| Input Validation | Joi — body + query |
| SQL Injection | Sequelize parameterised queries |
| Error Masking | Production errors are generic |

---

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment |
| `PORT` | `3000` | HTTP port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `school_management_db` | Database name |
| `DB_USER` | `root` | DB username |
| `DB_PASSWORD` | — | DB password |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |
| `LOG_LEVEL` | `info` | Winston log level |
| `ALLOWED_ORIGINS` | `*` | CORS allowed origins |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📜 License

MIT © 2024 — School Management API
