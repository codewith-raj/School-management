# 🚀 School Management API

Production-ready School Management backend built with Node.js, Express, and MySQL.  
It supports adding schools and listing schools sorted by proximity using the Haversine formula.

## 🔗 Live API

- Swagger Docs: [https://school-management-lv4b.onrender.com/api-docs/](https://school-management-lv4b.onrender.com/api-docs/)
- Health Check: [https://school-management-lv4b.onrender.com/health](https://school-management-lv4b.onrender.com/health)
- Base URL: `https://school-management-lv4b.onrender.com`

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MySQL (Railway)
- Sequelize ORM
- Joi Validation
- Swagger (OpenAPI)
- dotenv
- morgan + winston
- helmet, cors, express-rate-limit

---

## ✨ Features

- Add school with geolocation (`latitude`, `longitude`)
- List schools sorted by nearest distance from user location
- Haversine distance calculation (manual implementation)
- Input validation and sanitization
- Global error handling + 404 middleware
- Security middleware (helmet, cors, rate limiting)
- Standardized JSON response format
- Deployment-ready on Render

---

## 📌 API Endpoints

### Assignment Endpoints

- `POST /addSchool`
- `GET /listSchools?latitude=<lat>&longitude=<lon>`

### Main Endpoints

- `POST /api/schools`
- `GET /api/schools?latitude=<lat>&longitude=<lon>&page=1&limit=10`
- `GET /api/schools/:id`
- `GET /health`
- `GET /api-docs`

---

## 📍 Distance Logic

`/listSchools` and `/api/schools` (GET) calculate distance in kilometers using the Haversine formula:

- computes great-circle distance between user coordinates and each school
- attaches `distance` field to each school
- sorts schools in ascending order by distance

---

## 📦 Request / Response Examples

### Add School

**POST** `/addSchool`

```json
{
  "name": "ABC School",
  "address": "Sector 1, Noida",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

### List Schools

**GET** `/listSchools?latitude=28.6139&longitude=77.2090&page=1&limit=5`

### Standard Response

```json
{
  "success": true,
  "message": "Schools retrieved and sorted by distance.",
  "data": {},
  "errors": []
}
```

Health response:

```json
{
  "status": "OK"
}
```

---

## ⚙️ Local Setup Instructions

1. Install dependencies

```bash
npm install
```

2. Configure env

```bash
cp .env.example .env
```

3. Initialize DB and optional seed

```bash
npm run setup
npm run seed
```

4. Run app

```bash
npm run dev
```

---

## ☁️ Render Deployment (Current Live Setup)

### Render service settings

- Build Command: `npm install`
- Start Command: `npm start`

### Required environment variables

- `NODE_ENV=production`
- `HOST=0.0.0.0`
- `DATABASE_URL=<your railway mysql url>`
- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX=100`
- `LOG_LEVEL=info`
- `ALLOWED_ORIGINS=*` (or frontend domain)

> Note: Render injects `PORT` automatically. Do not hardcode a different port in deployment.

---

## 🧪 Testing

- Import `postman_collection.json` into Postman
- Set `baseUrl` variable:
  - local: `http://localhost:3000`
  - production: `https://school-management-lv4b.onrender.com`

---

## 📄 License

MIT
