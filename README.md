# Lend IT Book Kiosk

A Redbox-style kiosk system for physical book lending. Built with React + Spring Boot.

## Project structure

```
lend-it-book-kiosk/
├── GUIDE.md         ← read this first
├── backend/         ← Spring Boot 3 + Java 21 REST API
└── frontend/        ← React 18 + Vite SPA
```

## Quick start

**Terminal 1 — backend:**

```bash
cd backend
mvn spring-boot:run
```

Backend lives at `http://localhost:8080`.

**Terminal 2 — frontend:**

```bash
cd frontend
npm install
npm run dev
```

App opens at `http://localhost:5173`.

## Next steps

Read [`GUIDE.md`](./GUIDE.md) for architecture, tech stack reasoning, deployment options (Netlify + AWS), and a feature roadmap.

## Seeded test flow

1. Register any email/password
2. Browse the 10 seeded books
3. Click a book → Borrow
4. Visit My Loans → Return
