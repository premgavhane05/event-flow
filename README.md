# EventFlow

A concurrency-safe event ticket reservation backend. Prevents overselling
using database transactions + row-level locking (`SELECT ... FOR UPDATE`).

## What's implemented (and honestly, what's not)

**Implemented and tested through the concepts you can explain:**
- Auth: register/login, JWT, bcrypt password hashing, role-based authorization
- Events: create/update/cancel (ORGANIZER), browse (public)
- Seats: bulk-create per event, list per event
- Reservations: hold a seat with row-level pessimistic locking, cancel a hold
- Health check: verifies MySQL + Redis connectivity
- Centralized error handling

**NOT implemented as running code** (we covered these conceptually — do not
claim to have working code for these in an interview, but you can explain
the design):
- Hold expiry background job (seats currently stay HELD forever until
  manually cancelled — no TTL sweep yet)
- Payment simulation + idempotency-key enforcement
- BullMQ background jobs / notifications
- Rate limiting
- Automated tests / load testing

## Setup

### 1. Prerequisites
- Node.js 18+
- Docker Desktop running

### 2. Install dependencies
```bash
npm install
```

### 3. Start MySQL + Redis
```bash
docker compose up -d
```

### 4. Configure environment
```bash
cp .env.example .env
```
The defaults in `.env.example` match `docker-compose.yml` exactly — no
edits needed for local dev.

### 5. Run the server
```bash
npm run dev
```
Tables are auto-created on boot via `sequelize.sync()`.

### 6. Verify it's alive
```bash
curl http://localhost:3000/health
```
Expect: `{"server":"ok","mysql":"ok","redis":"ok"}`

## Demo flow (copy-paste in order)

```bash
# 1. Register an organizer
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Organizer","email":"org@test.com","password":"pass123","role":"ORGANIZER"}'

# 2. Login as organizer -> copy the token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"org@test.com","password":"pass123"}'

# 3. Create an event (paste token below)
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ORGANIZER_TOKEN>" \
  -d '{"title":"Concert Night","venue":"Main Hall","startsAt":"2026-12-01T19:00:00Z"}'

# 4. Add seats to event id 1
curl -X POST http://localhost:3000/api/v1/events/1/seats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ORGANIZER_TOKEN>" \
  -d '{"labels":["A1","A2","A3"]}'

# 5. Register a regular user, login, get their token

# 6. Hold seat 1 as that user
curl -X POST http://localhost:3000/api/v1/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -d '{"seatId":1}'

# 7. Try holding the SAME seat again (with any token) -> should get 409 Conflict
```

Step 7 is your live demo of the concurrency protection: run it from two
terminals at once against the same `seatId` and only one will succeed —
the other gets `409 { "error": "Seat is not available" }`.

## Project structure

```
src/
  config/       env validation, DB + Redis connections
  models/       Sequelize models (User, Event, Seat, Reservation)
  services/     business logic (auth, event, reservation)
  controllers/  HTTP layer — parse request, call service, shape response
  routes/       route definitions, mounted under /api/v1
  middlewares/  JWT auth, role authorization, centralized error handler
  app.js        Express app (no .listen() — testable in isolation)
  server.js     boots DB/Redis, then starts the HTTP server
```

## The core design decision: why `SELECT ... FOR UPDATE`?

Two users hitting `POST /reservations` for the same seat at nearly the same
instant is a race condition: a plain read-then-write can let both see
`AVAILABLE` before either writes. `FOR UPDATE` takes an exclusive row lock
inside a transaction — the second request's read is forced to *block* until
the first transaction commits, so it correctly sees `HELD` and gets rejected.
See `src/services/reservation.service.js` — the whole mechanism is under 20
lines.
