# Chess Rules — ChessAlive Domain Rules

## Standard Chess Rules

All standard FIDE chess rules apply. chess.js enforces these automatically:

- Legal move validation
- Check / checkmate detection
- Stalemate detection
- Fifty-move rule
- Threefold repetition
- En passant
- Castling (kingside and queenside)
- Pawn promotion

## Pawn Promotion

- Default promotion: Queen
- Players may specify promotion piece (q, r, b, n) in the move payload

## Game Termination Conditions

| Condition | Result |
|-----------|--------|
| Checkmate | Opponent wins |
| Stalemate | Draw |
| Threefold repetition | Draw |
| Fifty-move rule | Draw |
| Insufficient material | Draw |
| Resignation | Opponent wins |
| Draw agreement | Draw |
| Timeout (not yet implemented) | Opponent wins |

## Time Controls (default: 10 minutes)

- Time control is stored per game in seconds
- Clock logic TBD in a future update

## Rating System (Elo)

- Default rating: 1200
- Rating updates post-game TBD

## Domain Invariants

1. Moves are always validated server-side using chess.js — client suggestions are never trusted directly
2. A game must be in ACTIVE status to accept moves
3. Only the correct player's turn is valid (enforced by chess.js)
4. A finished game is immutable
