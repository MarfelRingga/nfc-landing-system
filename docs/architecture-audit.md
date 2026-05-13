# Rifelo Architecture Audit

This document is the result of a deep architecture audit of the current Rifelo system, focusing particularly on domain boundaries, queue system isolation, real-time consistency, hardware interactions (NFC), and database scalability.

## 1. Current Architecture Strengths

- **Lean & Isolated Queue System:** The migration from a "Photobooth-only" to a "General Queue" (`/q`) system maintains strict isolation from the primary Rifelo Circle/Inbox domains.
- **Concurrency Safety via RPCs:** The usage of `pb_join_queue` and other atomic SQL transactions (e.g., `FOR UPDATE SKIP LOCKED`) directly within Supabase securely protects the application against race conditions without relying on heavy application-layer distributed locks.
- **Stateless Polling Strategy:** Instead of defaulting to costly WebSockets or Supabase Realtime (which drains Free Tier connection limits), the system strictly utilizes adaptive edge-cached polling (e.g., `/api/queue/current`), maintaining high efficiency.
- **Passive Token Lifecycle Cleanup:** Tokens aren't cleared via unnecessary active cron jobs. Instead, lazy cleanup is injected passively during the generation of new tokens (`/api/token/generate`), an extremely cost-efficient optimization.

## 2. Missing Documentation Areas

- **NFC Interaction Architecture & Hardware Communication Model:** The gap between generating a token and joining (`/q/join`) is not fully defined. It is implied that NFC tags redirect to a URL with a token query, but whether the tags are statically flashing unique tokens or using dynamic encoders (and how the hardware performs the handoff) is entirely missing from architecture discussions.
- **State Machine Enforcement & Rollbacks:** The queue states (`WAITING` ➝ `CALLED` ➝ `IN_SESSION` ➝ `DONE` / `SKIPPED`) are well-defined. However, the documentation completely ignores rollback scenarios (e.g., moving someone from `IN_SESSION` back to `WAITING` due to hardware malfunction or camera freeze).
- **Admin Separation & Event Isolation:** How multiple concurrent events operated by the same admin (or different admins on the same tenant) restrict scope and block cross-contamination of Event IDs lacks explicit boundary definitions.

## 3. Hidden Risks

- **API Trust Boundaries & Security Assumptions:** Extreme reliance on `supabaseAdmin` (Service Role Key) within Next.js API routes (`/api/queue/join`, `/api/token/generate`). If parameter scoping (`event_id`) relies purely on client-side logic without strict RLS or session verification at the route level, malicious users could guess `event_id` and spoof/skip queues.
- **Failure Handling in Result Saves:** If the `result_url` fails to attach natively (i.e. physical hardware disconnects during photo upload), the queue could be stranded indefinitely in `IN_SESSION` status. There is no automated TTL timeout moving stranded queues to `SKIPPED`.
- **Supabase Dependency Assumptions:** Deeply binding core business logic to vendor-specific PL/pgSQL RPCs creates vertical lock-in while obscuring queue transition rules from the TypeScript application domain.

## 4. Scalability Constraints

- **Infrastructure Bottlenecks (Polling Storms):** While HTTP Edge Caching (`Cache-Control: public, s-maxage=2`) mitigates repeated database reads, any sudden burst of NFC interaction exactly when the cache expires (A "cache stampede") results in multiple simultaneous Serverless functions all attempting to query Postgres.
- **Database Connection Thrashing:** Because Next.js App Router API endpoints spin up rapidly under load, heavy concurrent traffic using `supabaseAdmin` outside of a connection pooler (like Supavisor or PgBouncer) may trigger Postgres connection drops under intense burst loads.

## 5. Recommended Additions to architecture.md

*When updating the primary architecture documentation, add the following without rewriting the core:*

- **Hardware/NFC State Flow Diagram:** Document exactly what URL the NFC hardware writes/reads, and how the physical client handles network loss during an NFC tap.
- **API Trust Boundaries Mapping:** Specifically define which operations are considered "Public/Anonymous Client" (RLS restricted) versus "Admin/Elevated Context" (Service Key permitted).
- **Retry & Recovery Protocol:** Document the manual override flow for Admins when the state machine gets frozen (Camera crashes, user abandons queue during `CALLED`).
- **Data Retention & Expiry:** Outline the TTL rules for `/q/[event_id]` histories to ensure the `queues` table does not grow infinitely, maintaining cost efficiency.

## 6. Things That Should NOT Be Added Yet

- **Do NOT add WebSocket/Supabase Realtime implementations:** Stand firmly by the optimized Polling model. Real-time Pub/Sub is fake enterprise complexity that will break free tier constraints unnecessarily right now.
- **Do NOT add complex State Machine Libraries (like XState):** Simple database-enforced enums are more than enough.
- **Do NOT add Multi-Tenant Microservices architecture:** Single database schemas isolated by `event_id` enforce perfectly acceptable mobile-first boundaries without over-engineering.

## 7. Production Readiness Concerns

- **Concurrency Safety for Admins:** What if two admins press "Next Queue" for the *same* `event_id` simultaneously on different mobile devices? While `FOR UPDATE SKIP LOCKED` helps the database safely pick one, UI visual desync may cause double-calls.
- **Mobile-First Constraints:** During large events, 3G/4G connectivity plummets. Current architecture does not seem to handle offline-first mutation queueing for admins updating statuses.
- **Queue Hoarding:** If the `token_code` methodology via NFC allows scanning and saving URLs directly, bad actors can hoard the URLs before entering and join from a distance. Needs a Time-to-Live (TTL) bound to the physical tap interaction.

## 8. Suggested Future Architecture Triggers

*Only transition to these if current assumptions definitively fail:*

- **Trigger:** Polling caching fails to prevent Database CPU throttling.
  *Action:* Transition to Supabase Realtime limit broadcasts based strictly on PostgreSQL triggers.
- **Trigger:** Postgres row-locking introduces noticeable latency on `Next Queue` requests during massive multi-booth activations.
  *Action:* Export the Queue State purely into Redis.
- **Trigger:** Camera/Photobooth native software must interact without Admin intervention.
  *Action:* Implement Webhook Listeners utilizing HMAC SHA-256 validation to mark `IN_SESSION` automatically purely from the camera software API.
