# Database Architecture

## Core Database Philosophy

The Rifelo database leverages PostgreSQL (Supabase) as the ultimate source of truth, an active concurrency controller, and a strict ownership validator. Rather than relying on fragile application-layer locking mechanisms, Rifelo pushes transactional safety directly into the database. The architecture is fiercely protective of free-tier limitations, prioritizing operational simplicity, lean architecture, and mobile-first performance over massive distributed complexity.

## Main Database Domains

The database is divided into four distinct conceptual domains:

*   **Identity Domain (`circles`, `users`, `members`):** Defines tenant separation and access control. Circles maintain environment styling (Resonance/Aura) and secure access roles.
*   **Event Domain (`events`, `booths`):** Represents the physical or temporal boundary for queues. Events tightly scope all physical interactions to prevent cross-contamination.
*   **Queue Domain (`queues`):** Manages the micro-lifecycle of a single physical interaction. This is the most volatile and heavily contested domain.
*   **NFC/Token Domain (`tokens`):** Handles the physical-to-digital state handoff. Tokens act as ephemeral, one-time-use handshake mechanisms.

## Queue State Machine

The queue lifecycle represents a one-way temporal progression controlled heavily by backend mutations to preserve transactional consistency.

The canonical state progression acts as a ratchet:
`WAITING` ➝ `CALLED` ➝ `IN_SESSION` ➝ `DONE` / `SKIPPED`

*   **WAITING:** The user has joined the queue.
*   **CALLED:** The user is actively summoned to the physical location.
*   **IN_SESSION:** The interaction is currently taking place.
*   **DONE:** The interaction was successfully completed.
*   **SKIPPED:** The interaction was abandoned or skipped.

Transitions rely on explicit updates from either the Admin applications or System APIs, ensuring deterministic queue progression.

## Token Lifecycle

Tokens are designed around an ephemeral interaction philosophy. They serve as a lightweight, low-overhead mechanism for one-time usage. To maintain extreme cost-efficiency and keep table sizes naturally bounded, the token lifecycle utilizes a lazy cleanup strategy. Instead of relying on active cron jobs, stale tokens are passively swept and deleted during routine mutations (like new token generation).

## NFC Ownership Model

The NFC architecture provides a physical-to-digital interaction bridge. An NFC tag itself holds no persistent state or user session; it merely surfaces an ephemeral token.
When a user taps an NFC tag, the system uses this token to facilitate an ownership handoff. Server-side validation confirms the token's validity, instantly mapping the physical device interaction to a secure position within an event's queue.

## RLS & Security Philosophy

Rifelo employs a split-authority security model prioritizing minimal client trust:

*   **Row Level Security (RLS):** Standard reads and writes are heavily restricted by strict RLS boundaries, scoping access to specific users, owners, or circle members.
*   **Trusted Backend Context:** Complex, high-concurrency operations (such as token generation or queue joining) intentionally bypass RLS. These mutations occur securely within Serverless Service Role Admin contexts. This guarantees backend execution safety and event isolation without overloading RLS policies with complex business logic.

## Concurrency Philosophy

Database-first consistency is paramount. During high-concurrency spikes (e.g., a massive crowd scanning NFCs simultaneously), Rifelo utilizes PostgreSQL's native row locking (`SELECT ... FOR UPDATE SKIP LOCKED` inside RPCs). This provides absolute transactional guarantees, ensuring that no two digital devices ever successfully claim or overwrite the exact same logical queue position.

## Polling & Realtime Philosophy

Rifelo strictly favors edge-cached HTTP polling over active WebSocket (Supabase Realtime) connections.

*   **Free-tier Sustainability:** WebSockets aggressively consume active concurrent connection quotas.
*   **Operational Simplicity:** Polling via highly cacheable snapshots (`/api/queue/current`) shields the database from traffic storms and allows for gradual, sustainable scaling.
*   **Mobile-first pragmatism:** Intermittent mobile connectivity is better handled via resilient polling cycles rather than fragile persistent socket connections.

## Migration Philosophy

Schema evolution must prioritize safe incremental migrations and backward compatibility to ensure minimal production disruption. Critical paths (such as core Supabase RPCs) are treated as first-class internal APIs. Database changes are designed to adapt existing data gracefully, preferring flexible `TEXT` columns with strict `CHECK` constraints over rigid Postgres native ENUMs when application agility is needed.

## Scalability Philosophy

Scalability is achieved through simplicity and domain separation, not through sprawling microservices. The architecture relies on:

*   **Indexing-First Scaling:** Using targeted partial indexes to heavily optimize frequent lookups (e.g., active queue states).
*   **Lightweight APIs:** Minimizing payload bloat and pushing state resolution to edge caching where possible.
*   **Gradual Infrastructure Evolution:** Delaying the introduction of dedicated connection poolers or caching layers (like Redis) until explicit bottlenecks mandate them.

## Current Limitations

Current tradeoffs reflect MVP-stage operational pragmatism:
*   State reversal (e.g., returning from `DONE` back to `WAITING`) relies solely on the application server layer rather than database-enforced invariants.
*   Heavy reliance on Service Role APIs under extreme burst loads risks exhausting default PostgreSQL connection limits without a mature load-balancing proxy pooler.

## Things Intentionally Avoided

To protect velocity and lean principles, the following patterns are explicitly and intentionally avoided:

*   Premature microservices and domain splitting.
*   WebSocket-heavy real-time infrastructure.
*   Event Sourcing and CQRS write-models.
*   Excessive audit logging (`trigger_audit_log` tables).
*   Universal or default soft-delete systems (`deleted_at` across volatile tables).
*   Fake-enterprise orchestration complexity.

# Event Isolation Enforcement

Every queue row and operational interaction within the queue system is strictly bound to a specific `event_id`. This explicit scoping fundamentally prevents data cross-contamination.

*   All queue operations, reads, and mutations must be explicitly event-scoped.
*   Backend validation APIs must aggressively validate ownership authority before executing any mutation.
*   Admins can only mutate events they explicitly own or manage.
*   Frontend clients (users or displays) must never dictate an arbitrary event scope.

Event isolation is structurally enforced through a combination of strict backend validation, explicitly scoped queries, RLS policies on public-facing tables, and protected service-role execution for complex mutations. No queue state is ever permitted to bleed across event boundaries.