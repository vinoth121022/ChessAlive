# Chess Game Rules — Backend Validation Reference

Complete rule set for server-side move validation and game state management.

---

## 1. Turn System

```
- White always moves first
- Players alternate turns strictly — no player may move twice in a row
- A turn is complete only when a legal move is successfully applied
- Validate: current turn matches the requesting player's color
- Server tracks: currentTurn = WHITE | BLACK
```

---

## 2. Piece Movement Rules

### 2.1 Pawn

```
Color   Direction     Normal Move              Capture
─────────────────────────────────────────────────────
WHITE   Up (rank+1)   1 square forward         Diagonal forward-left / forward-right
BLACK   Down (rank-1) 1 square forward         Diagonal forward-left / forward-right

Initial double move:
  - Allowed only if pawn is on its starting rank (rank 2 for WHITE, rank 7 for BLACK)
  - Both squares in front must be empty
  - Cannot jump over a piece

Constraints:
  - Cannot move forward if destination square is occupied
  - Can only capture diagonally (not forward)
  - Cannot move backward
```

### 2.2 Knight

```
Move pattern: L-shape — 2 squares in one axis + 1 square in perpendicular axis
All 8 possible offsets: (+2,+1) (+2,-1) (-2,+1) (-2,-1) (+1,+2) (+1,-2) (-1,+2) (-1,-2)

Constraints:
  - Only piece that can jump over other pieces
  - Cannot land on a square occupied by a friendly piece
```

### 2.3 Bishop

```
Moves diagonally any number of squares (4 diagonal directions)

Constraints:
  - Cannot jump over pieces — path must be clear
  - Cannot land on a friendly-occupied square
  - Always stays on its starting color square
```

### 2.4 Rook

```
Moves horizontally or vertically any number of squares (4 directions)

Constraints:
  - Cannot jump over pieces — path must be clear
  - Cannot land on a friendly-occupied square
```

### 2.5 Queen

```
Combines Rook + Bishop movement
Moves any number of squares in 8 directions (horizontal, vertical, diagonal)

Constraints:
  - Cannot jump over pieces — path must be clear
  - Cannot land on a friendly-occupied square
```

### 2.6 King

```
Moves exactly 1 square in any of 8 directions

Constraints:
  - Cannot move to a square occupied by a friendly piece
  - Cannot move to a square that is under attack by any enemy piece
  - Cannot move into check
```

---

## 3. Special Moves

### 3.1 Castling

```
Two variants: Kingside (O-O) and Queenside (O-O-O)

Preconditions — ALL must be true:
  1. King has not previously moved (track: kingMoved flag per color)
  2. Target rook has not previously moved (track: rookMoved[KINGSIDE|QUEENSIDE] per color)
  3. King is not currently in check
  4. All squares between King and Rook are empty
  5. King does not pass through a square under attack
  6. King does not land on a square under attack

Execution:
  Kingside:  King e1→g1, Rook h1→f1  (WHITE)
             King e8→g8, Rook h8→f8  (BLACK)
  Queenside: King e1→c1, Rook a1→d1  (WHITE)
             King e8→c8, Rook a8→d8  (BLACK)

Invalidation triggers:
  - King moves → both castling rights lost for that color
  - Kingside rook moves → kingside castling right lost
  - Queenside rook moves → queenside castling right lost
  - Rook is captured → corresponding castling right lost

State to track per color: canCastleKingside, canCastleQueenside (boolean)
```

### 3.2 En Passant

```
Condition:
  - Opponent's pawn just moved two squares forward (double pawn push)
  - Your pawn is on the 5th rank (rank 5 for WHITE, rank 4 for BLACK)
  - Your pawn is on an adjacent file to the opponent's pawn

Execution:
  - Your pawn moves diagonally to the square behind the opponent's pawn
  - The opponent's pawn is removed from the board (not from your landing square)

Validity window:
  - En passant is only legal on the IMMEDIATELY following move
  - If not taken immediately, the right expires

State to track: enPassantTargetSquare (nullable) — set after every double pawn push, cleared after any other move
```

### 3.3 Pawn Promotion

```
Trigger:
  - WHITE pawn reaches rank 8
  - BLACK pawn reaches rank 1

Rules:
  - Promotion is mandatory — pawn cannot remain a pawn
  - Player must choose: Queen | Rook | Bishop | Knight
  - Default to Queen if no choice is provided (server-side fallback)
  - The promoted piece is placed on the destination square immediately
  - Check/checkmate must be evaluated AFTER promotion

Validation:
  - Reject the move if promotion piece is not specified for a promotion move
  - Only allow: Q, R, B, N as promotion targets (not King or Pawn)
```

---

## 4. Check Detection

```
A king is IN CHECK when any enemy piece can legally move to the king's square.

Algorithm:
  1. Find the current player's king position
  2. For each enemy piece on the board, compute all squares it attacks
  3. If king's square is in that set → king is in check

Validation rule:
  - A move is illegal if it leaves or places the moving player's own king in check
  - This applies to ALL move types including castling, en passant, and promotion
  - After every candidate move: simulate the board, check if own king is attacked → reject if true
```

---

## 5. Checkmate Detection

```
Checkmate = King is in check AND no legal move exists to escape

Algorithm:
  1. Confirm king is currently in check
  2. Generate ALL legal moves for the current player
     - For each piece, generate candidate moves
     - Simulate each move on a copy of the board
     - If the move leaves own king in check → discard (illegal)
  3. If legal move list is empty → CHECKMATE
  4. Result: the player whose turn it is LOSES

Escape options (any one is sufficient to avoid checkmate):
  a. Move the king to a safe square
  b. Block the attacking piece with another piece
  c. Capture the attacking piece
```

---

## 6. Draw Conditions

### 6.1 Stalemate

```
Trigger: Current player is NOT in check but has NO legal moves

Algorithm:
  1. Confirm king is NOT in check
  2. Generate all legal moves for current player
  3. If list is empty → STALEMATE → Draw

Result: Game ends immediately as a draw
```

### 6.2 Threefold Repetition

```
Trigger: The same board position occurs 3 times with the same:
  - Side to move
  - Castling rights (all 4 flags)
  - En passant target square

State to track: Map<positionHash, count>
  - Increment count on each move
  - Use Zobrist hashing or FEN string as position key

Result: Draw can be claimed by either player when count reaches 3
  - In server implementation: auto-draw at 3rd repetition
```

### 6.3 Fifty-Move Rule

```
Trigger: 50 consecutive full moves (100 half-moves) with:
  - No pawn moved
  - No capture made

State to track: halfMoveClock (integer)
  - Reset to 0 on any pawn move or capture
  - Increment by 1 on all other moves
  - When halfMoveClock >= 100 → Draw

Result: Draw can be claimed; auto-apply in server implementation
```

### 6.4 Insufficient Material

```
Automatic draw when neither side has enough material to deliver checkmate:

Draw cases:
  - King vs King
  - King + Bishop vs King
  - King + Knight vs King
  - King + Bishop vs King + Bishop (bishops on same color)

Not a draw (checkmate still theoretically possible):
  - King + 2 Knights vs King (forced mate not possible but not auto-draw)
  - Any position with Rook, Queen, or Pawn present

Result: Detect after every move; auto-draw if condition is met
```

### 6.5 Mutual Agreement (Draw Offer)

```
Flow:
  1. Player A sends draw offer
  2. Player B must accept or decline
  3. Offer is valid only for opponent's next move window
  4. If Player B makes a move instead → offer is implicitly declined

Result: Draw only if both players explicitly agree
```

---

## 7. Game Termination Summary

| Condition | Result | Detection Point |
|-----------|--------|-----------------|
| Checkmate | Current player loses | After every move |
| Stalemate | Draw | After every move |
| Threefold repetition | Draw | After every move |
| Fifty-move rule | Draw | After every move |
| Insufficient material | Draw | After every move |
| Resignation | Resigning player loses | On explicit event |
| Draw agreement | Draw | On explicit accept |
| Timeout | Timed-out player loses | On clock expiry |

---

## 8. Move Validation — Server Execution Order

```
On receiving move { gameId, from, to, promotion? }:

1.  Authenticate player (JWT → userId)
2.  Load GameSession from memory store
3.  Confirm game status = ACTIVE
4.  Confirm it is this player's turn
5.  Confirm a piece exists at `from` and belongs to this player
6.  Generate legal moves for that piece
7.  Confirm `to` is in the legal move set
8.  Check if move requires promotion → validate promotion piece provided
9.  Apply move to board (update FEN, captured pieces, clocks)
10. Update en passant target square
11. Update castling rights flags
12. Increment halfMoveClock or reset (capture / pawn move)
13. Increment fullMoveNumber (after BLACK's move)
14. Check for checkmate → if true: end game, persist result
15. Check for stalemate → if true: end game, persist result
16. Check for insufficient material → if true: end game
17. Check for fifty-move rule → if true: end game
18. Check for threefold repetition → if true: end game
19. Switch turn to opponent
20. Broadcast updated state to both players
```

---

## 9. State Object Reference

```java
class GameSession {
    String  gameId;
    String  whitePlayerId;
    String  blackPlayerId;
    String  fen;                          // Current board state
    Color   currentTurn;                  // WHITE | BLACK
    int     halfMoveClock;                // For 50-move rule (reset on pawn move / capture)
    int     fullMoveNumber;               // Increments after Black's move
    String  enPassantTargetSquare;        // Nullable — e.g. "e3"
    boolean whiteCanCastleKingside;
    boolean whiteCanCastleQueenside;
    boolean blackCanCastleKingside;
    boolean blackCanCastleQueenside;
    Map<String, Integer> positionHistory; // FEN key → occurrence count (threefold)
    GameStatus status;                    // WAITING | ACTIVE | FINISHED
    GameResult result;                    // WHITE_WIN | BLACK_WIN | DRAW | null
}
```

---

## 10. Domain Invariants

```
1. The server is the sole authority on move legality — never trust the client
2. A king may never be left in check after a move, for any reason
3. Castling rights, once lost, cannot be restored
4. En passant rights expire after exactly one move
5. A finished game is immutable — no further moves accepted
6. Promotion is mandatory when a pawn reaches the back rank
7. Check/checkmate evaluation always happens after the full move is applied
8. A game must be in ACTIVE status to accept any move
```
