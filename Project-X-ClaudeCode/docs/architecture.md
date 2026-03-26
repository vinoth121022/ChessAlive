# ChessAlive Architecture

## Overview

ChessAlive is a full-stack chess platform with a decoupled frontend and backend.

## Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Real-time | Socket.io |
| Chess Engine | chess.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (7-day expiry) |

## Architecture Diagram

```
Browser
  │
  ├── HTTP (REST)  ──→  Express API  ──→  PostgreSQL (via Prisma)
  │
  └── WebSocket   ──→  Socket.io    ──→  PostgreSQL (via Prisma)
```

## Directory Structure

```
/
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # Pages (App Router)
│       ├── components/# UI components
│       ├── hooks/     # Custom React hooks
│       ├── lib/       # API client, socket
│       └── types/     # TypeScript types
└── backend/           # Express API
    └── src/
        ├── routes/    # HTTP endpoints
        ├── controllers/
        ├── services/  # Business logic
        ├── socket/    # WebSocket handlers
        ├── middleware/ # Auth, validation
        └── types/
```

## Key Design Decisions

1. **chess.js on both sides**: FEN/move validation happens server-side for authority; client uses it for UI hints only.
2. **Socket.io rooms**: Each game gets its own room (`gameId`). Only moves, not full state diffs, are emitted.
3. **JWT in localStorage**: Simple for MVP. Migrate to httpOnly cookies for production.
4. **Prisma**: Migrations are version-controlled. All schema changes go through `prisma migrate dev`.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login |
| GET | /api/users/me | Yes | Get own profile |
| GET | /api/users/:username | No | Get user profile |
| GET | /api/games/my | Yes | Get my games |
| GET | /api/games/:gameId | Yes | Get game by ID |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| game:join | Client → Server | Join a game room |
| game:move | Client → Server | Make a move |
| game:resign | Client → Server | Resign |
| game:draw_offer | Client → Server | Offer draw |
| game:update | Server → Client | Game state updated |
| game:ended | Server → Client | Game over |
| game:error | Server → Client | Error message |
