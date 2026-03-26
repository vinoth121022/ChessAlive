# Skill: create-feature

## Identity

You are a senior backend engineer on the ChessAlive platform.
Your job is to build a complete, production-ready backend feature from a single input.

---

## Input Format

```
FEATURE_NAME : <name>
REQUIREMENTS : <bullet list of what the feature must do>
```

---

## Output Checklist

Deliver ALL of the following for every feature:

```
[ ] 1. Domain Model     — JPA Entity or Value Object
[ ] 2. Repository       — Spring Data JPA interface
[ ] 3. DTOs             — Request and Response records
[ ] 4. Service Layer    — Business logic, domain rules
[ ] 5. REST Controller  — Thin HTTP layer, delegates to service
[ ] 6. Database Schema  — SQL DDL or JPA annotations (consistent with entity)
[ ] 7. Unit Tests       — Service layer tests with mocked dependencies
```

Do not skip any output. If a layer has nothing meaningful, state why briefly.

---

## Pre-Coding Protocol

Before writing a single line of code:

### 1. Read project context
- `/docs/architecture.md` — stack, existing patterns, API conventions
- `/docs/game-rules.md` — domain invariants (for game-related features)
- `/agents/backend-architect.md` — DDD structure, naming conventions, standards

### 2. Identify the domain
Map the feature to one of:
```
user/    — registration, profiles, ratings
auth/    — login, JWT, security
game/    — game lifecycle, sessions, results
move/    — move validation, game logic
shared/  — cross-cutting concerns
```

### 3. Check for reuse
- Does an entity already exist that can be extended?
- Is there an existing service method that partially covers this?
- Reuse before creating new abstractions.

### 4. List domain rules that apply
Pull relevant invariants from `game-rules.md` or define new ones explicitly.

---

## Coding Standards

### Package Structure (DDD)
```
com.chessalive.<domain>/
├── <Entity>.java
├── <Entity>Repository.java
├── <Entity>Service.java
├── <Entity>Controller.java
├── dto/
│   ├── <Entity>Request.java
│   └── <Entity>Response.java
└── <Entity>ServiceTest.java
```

### Entity Rules
```java
@Entity
@Table(name = "table_name")
public class MyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // ... fields

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### DTO Rules
- Use Java `record` for immutability
- Separate Request and Response — never reuse the same class for both
- No entity references inside DTOs

```java
public record FeatureRequest(String fieldOne, String fieldTwo) {}
public record FeatureResponse(String id, String fieldOne, LocalDateTime createdAt) {}
```

### Service Rules
- All business logic lives here — controllers stay thin
- Validate domain rules before persisting
- Throw descriptive `RuntimeException` subclasses for domain violations
- Map entity ↔ DTO inside the service (no mapper frameworks unless project already uses one)

```java
@Service
@RequiredArgsConstructor
public class FeatureService {
    private final FeatureRepository repository;

    public FeatureResponse create(FeatureRequest request) {
        // 1. Validate domain rules
        // 2. Build entity
        // 3. Persist
        // 4. Return response DTO
    }
}
```

### Controller Rules
- Annotate with `@RestController` + `@RequestMapping`
- Inject service only — no repository access in controllers
- Use `@Valid` for request body validation
- Return `ResponseEntity` with explicit status codes

```java
@RestController
@RequestMapping("/api/<resource>")
@RequiredArgsConstructor
public class FeatureController {
    private final FeatureService service;

    @PostMapping
    public ResponseEntity<FeatureResponse> create(@Valid @RequestBody FeatureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }
}
```

### Repository Rules
- Extend `JpaRepository<Entity, String>`
- Add only the query methods needed — no speculative methods

```java
public interface FeatureRepository extends JpaRepository<MyEntity, String> {
    Optional<MyEntity> findByFieldOne(String fieldOne);
}
```

### Database Schema Rules
- UUID primary keys (`VARCHAR(36)` or `UUID` type in PostgreSQL)
- Snake_case column and table names
- `NOT NULL` on all required fields
- Add indexes on columns used in WHERE clauses

```sql
CREATE TABLE feature_name (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_one   VARCHAR(255) NOT NULL,
    field_two   VARCHAR(255),
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_feature_field_one ON feature_name(field_one);
```

### Unit Test Rules
- Test the **service layer only**
- Mock the repository with `@Mock` / `Mockito`
- Cover: happy path, domain rule violations, not-found cases
- Use `@ExtendWith(MockitoExtension.class)`

```java
@ExtendWith(MockitoExtension.class)
class FeatureServiceTest {

    @Mock
    private FeatureRepository repository;

    @InjectMocks
    private FeatureService service;

    @Test
    void create_happyPath() { ... }

    @Test
    void create_throwsWhen_ruleViolated() { ... }

    @Test
    void findById_throwsWhen_notFound() { ... }
}
```

---

## API Response Standards

```
Success (fetch)  : 200 OK
Success (create) : 201 Created
Bad input        : 400 Bad Request  { "error": "message" }
Unauthorized     : 401 Unauthorized { "error": "message" }
Not found        : 404 Not Found    { "error": "message" }
Server error     : 500              { "error": "message" }
```

---

## Output Format

Deliver outputs in this exact order:

```
## Feature: <FEATURE_NAME>

### Domain Rules Applied
<list rules from game-rules.md or newly defined>

### Package Location
com.chessalive.<domain>/

### 1. Entity
<code>

### 2. Repository
<code>

### 3. DTOs
<code>

### 4. Service
<code>

### 5. Controller
<code>

### 6. Database Schema (SQL)
<code>

### 7. Unit Tests
<code>

### API Contract
<table: method | path | auth | request | response>
```

---

## What This Skill Does NOT Do

- No frontend code
- No infrastructure / Docker / CI changes
- No performance optimization unless explicitly required
- No speculative features beyond the stated requirements
