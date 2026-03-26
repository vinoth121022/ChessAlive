# ChessAlive — System Architecture

---

## Overview

ChessAlive is a full-stack online chess platform supporting real-time 1v1 games
with multiple concurrent sessions.

---

## Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + chessboard.js + chess.js |
| Backend | Java + Spring Boot |
| Real-time | WebSocket (STOMP) |
| Auth | JWT (Spring Security) |
| Database | PostgreSQL (Spring Data JPA / Hibernate) |
| Active Game Store | In-Memory ConcurrentHashMap |

---

## High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                   React + Chessboard.js                 │
└────────────────┬────────────────┬───────────────────────┘
                 │  REST (HTTPS)  │  WebSocket (WSS)
                 ▼                ▼
┌─────────────────────────────────────────────────────────┐
│               Spring Boot Application                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  REST API   │  │  WS Handler  │  │  Game Engine   │ │
│  │ Controllers │  │  (STOMP)     │  │  (java-chess)  │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
│  ┌─────────────────────────────┐                        │
│  │       Service Layer         │                        │
│  │  AuthService | GameService  │                        │
│  └─────────────────────────────┘                        │
│  ┌─────────────────────────────┐                        │
│  │    In-Memory Game Store     │  ← ConcurrentHashMap  │
│  │    (active games only)      │                        │
│  └─────────────────────────────┘                        │
└──────────────────────────┬──────────────────────────────┘
                           │ JPA / Hibernate
                           ▼
                  ┌─────────────────┐
                  │   PostgreSQL    │
                  │  users, games   │
                  └─────────────────┘
```

---

## Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **React Frontend** | Render board, handle user input, manage WebSocket connection, show move history |
| **REST Controllers** | Auth (register/login), game creation, game history, user profiles |
| **WebSocket Handler** | Receive moves, broadcast updates to both players in a game session |
| **GameService** | Move validation, game state transitions, win/draw/resign detection |
| **In-Memory Game Store** | Hold active `GameSession` objects in a `ConcurrentHashMap<gameId, GameSession>` — fast access, no DB hit per move |
| **AuthService** | JWT issue/verify, password hashing (BCrypt) |
| **PostgreSQL** | Persist users, completed games, PGN, ratings |

---

## Data Flow — A Single Move

```
Player A clicks e2→e4
       │
       ▼
[React] Sends over WebSocket:
  { gameId, from: "e2", to: "e4", token: "JWT" }
       │
       ▼
[WS Handler] Authenticates JWT, identifies player
       │
       ▼
[GameService] Looks up GameSession from ConcurrentHashMap
  → Validates it's Player A's turn
  → Validates move legality (java-chess)
  → Updates board state (FEN)
  → Checks: checkmate? stalemate? draw?
       │
       ├── If game over → persist to PostgreSQL, remove from Map
       │
       ▼
[WS Handler] Broadcasts to game topic:
  { fen, lastMove, turn, status }
       │
       ▼
[React - Both Players] Receive update, re-render board
```

---

## API Endpoints (REST)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/users/me | Yes | Get own profile |
| GET | /api/users/{username} | No | Get user profile |
| POST | /api/games | Yes | Create / join a game |
| GET | /api/games/my | Yes | Get my game history |
| GET | /api/games/{gameId} | Yes | Get game by ID |

---

## WebSocket Events (STOMP)

| Event | Direction | Topic / Destination | Description |
|-------|-----------|---------------------|-------------|
| `/app/game.move` | Client → Server | — | Send a move |
| `/app/game.resign` | Client → Server | — | Resign |
| `/app/game.draw` | Client → Server | — | Offer / accept draw |
| `/topic/game/{id}` | Server → Client | broadcast | Game state update |
| `/topic/game/{id}/end` | Server → Client | broadcast | Game over |
| `/user/queue/errors` | Server → Client | private | Error message |

---

## Tech Stack Justification

| Choice | Why |
|--------|-----|
| **Spring Boot** | Built-in WebSocket (STOMP), Spring Security for JWT, Spring Data JPA — one framework covers everything |
| **STOMP over WebSocket** | Native Spring support via `@MessageMapping`. Topic-based routing fits 1v1 perfectly (`/topic/game/{id}`) |
| **ConcurrentHashMap for active games** | Zero DB round-trips during a game. Thread-safe. A 1hr game = ~100 moves — no need to persist each move |
| **PostgreSQL** | Relational model fits users ↔ games well. JSONB available for PGN/moves if needed |
| **React + chessboard.js** | chessboard.js handles drag-drop and rendering. chess.js on client for UI hints only — server is the source of truth |
| **JWT** | Stateless auth works well with WebSocket handshake authentication |

---

## Key Design Rules

1. **Server is truth** — client never trusts its own move validation for game state
2. **One `GameSession` object per game** — holds FEN, player IDs, turn, timers
3. **Persist only on game end** — not after every move
4. **WebSocket auth at handshake** — validate JWT in `HandshakeInterceptor`, not per-message

---

## Future Scalability Notes

| Problem | Solution |
|---------|----------|
| Multiple server instances share WebSocket sessions | Add Redis pub/sub to share game events across nodes |
| GameSession lost on restart | Persist active game state to Redis (TTL = game timeout) |
| High concurrent games (1000s) | Horizontal scale Spring Boot behind a load balancer (sticky sessions or Redis) |
| Move history / analytics | Add a read replica or separate event store |
| Bot / AI opponent | Integrate Stockfish via UCI protocol in a worker thread |

**Scaling path:** single node → Redis session store → horizontal pods

No Kafka needed until you have async pipelines (notifications, analytics).
