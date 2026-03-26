# ChessAlive ♟️

A full-featured chess platform inspired by chess.com — play live games, analyze positions, and track your progress.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Real-time | Socket.io |
| Chess Logic | chess.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. **Clone & install dependencies**
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

2. **Configure environment**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DB credentials and JWT secret

# Frontend
cp frontend/.env.example frontend/.env.local
```

3. **Set up database**
```bash
cd backend
npx prisma migrate dev --name init
```

4. **Start development servers**
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:3000
Backend API: http://localhost:4000

### Docker (optional)
```bash
docker-compose up
```

## Features

- Live chess games with real-time moves via WebSockets
- User registration & login (JWT auth)
- Game history & move notation
- Responsive chess board UI
- Matchmaking / game creation
- Resign & draw offers
- Check/checkmate/stalemate detection

## Project Structure

```
chessalive/
├── frontend/     # Next.js app
├── backend/      # Express API + Socket.io
└── docs/         # Architecture & rules
```
