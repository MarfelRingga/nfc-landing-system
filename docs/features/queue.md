# Queue System

## Queue Philosophy

The Rifelo Queue System is built on the principles of fairness, speed, and operational simplicity. It eschews complex queuing theories in favor of deterministic, linear progression optimized for real-world physical events. The system adopts a strict mobile-first behavior, assuming intermittent connectivity and varying device constraints. Its practical realtime philosophy ensures that users and admins perceive immediate state changes without relying on heavy and fragile persistent connection mechanisms. It is designed to be highly responsive to both human input and hardware triggers while maintaining absolute data integrity.

## Queue Actors

The queue system relies on strict authority boundaries to define actor responsibilities:

*   **Customer:** The end-user joining the queue. Their authority is limited to initiating the join request via a valid token and observing their position. They cannot mutate their queue state or the state of others.
*   **Admin 1 / Admin 2 (Operators):** Authorized personnel managing the event. They possess the authority to manually mutate queue states (e.g., call the next user, mark a session as done, or skip a user). The system ensures concurrency safety even if multiple admins operate simultaneously on the same event.
*   **Booth Display:** A purely observational actor. It consumes the current queue state to display visual feedback (e.g., who is currently called or in session) but has zero authority to mutate the queue.
*   **Hardware Trigger:** Physical devices (like automated cameras or sensors) capable of initiating specific API requests (e.g., signaling the end of a physical interaction). They act as privileged, stateless reporters of physical events.
*   **Backend System:** The ultimate source of truth and authority. It validates tokens, enforces concurrency locks, and executes all state transitions. 

## Queue Lifecycle

The canonical states of a queue form a rigid, deterministic, and linear flow. Mutations are exclusively backend-controlled.

*   **WAITING:** The user has successfully joined the queue and is awaiting their turn.
*   **CALLED:** The user has been summoned by an Admin to approach the physical interaction point.
*   **IN_SESSION:** The user is currently participating in the physical interaction.
*   **DONE:** The physical interaction is complete, and the queue entry is securely finalized.
*   **SKIPPED:** The user abandoned the queue, failed to respond to a call, or was manually bypassed by an Admin.

The progression philosophy ensures that state flow acts as a one-way ratchet under normal conditions, preventing accidental regressions or race conditions.

## Join Flow

The process of joining a queue revolves around an ephemeral ownership handoff. 

*   **NFC Interaction:** A physical device taps an NFC tag or scans a QR code, obtaining a one-time-use, ephemeral token.
*   **Token Validation:** The backend strictly evaluates the token to ensure it has not expired or been previously consumed.
*   **Anti-Duplicate Philosophy:** The system validates that the physical device (or user context) is not already actively participating in an overlapping queue, preventing queue hoarding.
*   **Queue Assignment:** Upon successful validation, the backend atomically assigns the user to the queue, discarding the used token and establishing digital ownership of that specific queue slot via a secure handshake.

## Polling & Realtime Philosophy

Rifelo maintains a practical realtime experience without the overhead of WebSockets. 

*   **Lightweight Polling:** Clients (users, displays, and admins) utilize optimized, interval-based HTTP polling to request queue snapshots.
*   **Edge Caching:** Read-heavy polling endpoints are aggressively edge-cached. This shields the database from traffic storms and ensures rapid responses.
*   **Mobile Resilience:** Interval polling naturally handles drops in mobile connectivity better than persistent sockets, allowing devices to cleanly resync the moment they regain signal.
*   **WebSocket Avoidance:** Persistent WebSockets drain server resources and connection limits while introducing unnecessary reconnection logic complexity for a system whose state mutations are generally measured in seconds or minutes, not milliseconds.

## Hardware Interaction Philosophy

The bridge between physical hardware and the digital queue is defined by a stateless, HTTP-trigger architecture.

*   **Lightweight Hardware:** Physical integrions (NFC encoders, cameras) contain zero business logic. They act simply as input/output mechanisms.
*   **NFC Role:** NFC acts exclusively as the physical delivery mechanism for ephemeral digital tokens. It holds no persistent state.
*   **Booth Display Behavior:** Displays operate as dumb terminals, polling the current active state and rendering it visually without maintaining any local authoritative state.

## Failure Handling Philosophy

Rifelo prioritizes operational recovery and human-in-the-loop overrides perfectly aligned with physical world chaos.

*   **Reconnect Handling:** Because the system is polling-based and the backend is authoritative, a client that loses connection simply requests the current snapshot upon reconnection, seamlessly resuming their context.
*   **Manual Override Philosophy:** Admins are explicitly empowered to manually override state (e.g., skip a user who walked away or manually push a user from `IN_SESSION` to `DONE` if a hardware trigger fails) to prevent physical bottlenecks.
*   **Abandoned Queue Handling:** Queues that remain inactive or unresponsive in `CALLED` or `IN_SESSION` states rely on manual Admin intervention (or eventual TTL sweeps) to move them to `SKIPPED`, ensuring the line continues moving.

## Event Isolation Philosophy

Queues do not exist in a vacuum; they are strictly bound by event logic.

*   **Strict Event Boundaries:** Every queue interaction is inherently locked to a specific `event_id`.
*   **Queue Separation:** The architecture guarantees complete isolation, meaning an isolated spike in Event A has zero logical bleed-over or state conflict with Event B.
*   **Admin Isolation:** The backend explicitly scopes Admin mutation authority to their assigned events, mathematically preventing cross-event contamination or accidental state disruption.

## Security Philosophy

The queue system is built on a foundation of minimal client trust.

*   **Backend-Controlled Mutations:** Clients cannot write their own queue states. All state progression routes through protected API constraints.
*   **Token Validation:** Joining a queue strictly requires a backend-generated, cryptographically validated, one-time token.
*   **Event-Scoped Access:** All operations are tightly constrained. Users can only observe their authorized endpoints; displays only see public active states; admins only mutate events they own.

## Scalability Philosophy

The queue system scales through simplicity.

*   **Polling Sustainability:** Relentless edge caching ensures that high-volume read traffic (thousands of users checking their queue position) rarely hits the primary database.
*   **Gradual Infrastructure Evolution:** The architecture avoids premature optimization like dedicated Redis instances or connection poolers, reserving those infrastructure leaps for when empirical metrics mandate them.
*   **Avoiding Premature Distributed Systems:** Rifelo purposefully ignores complex distributed queuing protocols in favor of atomic, lock-based PostgreSQL row management and simple HTTP standards.

## Things Intentionally Avoided

To protect velocity, maintainability, and architectural clarity, Rifelo intentionally rejects:

*   WebSocket-heavy streaming architectures.
*   External distributed queue brokers (e.g., Kafka, RabbitMQ).
*   Event Sourcing and complex asynchronous write-models.
*   Unnecessary microservice boundary splitting.
*   Overcomplicated orchestration systems (e.g., dedicated orchestration engines).
*   Frontend-authoritative queue states or optimistic UI updates that mask backend reality.
