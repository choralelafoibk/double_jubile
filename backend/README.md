# The Voïx — Backend Prototype

Prototype backend (Node.js + SQLite) for ticket-based voting.

Quick start

1. Open a terminal in `backend/`

```bash
cd backend
npm install
ADMIN_PASSWORD=ChoraleLaFOI2028 node server.js
```

2. Server will run on `http://localhost:3000` by default.

API endpoints

- `GET /api/health` — health check
- `POST /api/admin/generate-codes` — body `{ password, packType, count, votes, price }`
- `GET /api/tickets/:code` — verify ticket
- `POST /api/tickets/use` — body `{ code, userId, candidateId, candidateName, userName }`
- `GET /api/stats` — global stats
- `GET /api/candidates` — list candidates
- `POST /api/admin/reset-votes` — reset (admin password required)

Notes

- This is a prototype. For production use: add HTTPS, authentication, rate limiting, backups.
