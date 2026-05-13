# Service Role Boundaries

## Service Role Philosophy

The Supabase Service Role key is a full-access administrative credential that fundamentally bypasses Row Level Security (RLS). In the Rifelo architecture, it is treated as a dangerous but strictly necessary tool for executing protected, high-concurrency, server-side operations (such as queue assignment or token validation) where RLS would be too complex or inefficient. It must be guarded with extreme prejudice and is heavily restricted.

## Strict Validation Boundaries

Service Role logic is permitted ONLY under the following strict boundaries:

*   **Backend Exclusive:** The Service Role key is strictly isolated to backend environments. It is permitted exclusively within protected Next.js Server Routes and Server Actions.
*   **Never Client-Side:** It must NEVER be exposed to the browser, NEVER imported into client components, and NEVER passed as a public environment variable.
*   **Minimal Client Trust:** Any payload originating from a client (e.g., `event_id`, `token`) must be treated as implicitly hostile and validated before execution.
*   **Targeted Polling Avoidance:** High-volume public polling endpoints should rely on standard RLS and public anonymous keys wherever possible. Service Role usage is reserved exclusively for mandatory, backend-authoritative validation and mutation logic.

## Mandatory Execution Gates

Any backend mutation utilizing the Service Role key must manually enforce the security boundaries that RLS would normally provide. Every privileged execution must actively validate:

*   **Event Ownership:** Is the executing context explicitly authorized to mutate this specific `event_id`?
*   **Admin Authority:** Does the associated user session hold verified admin privileges for the target event or circle?
*   **Token Validity:** Is the submitted NFC/interaction token active, unexpired, and cryptographically valid within the system?
*   **Queue Scope:** Is the operation strictly locked to the relevant queue row to prevent collateral modification across events?

## Queue and Token Architecture

All queue mutations are strictly backend-authoritative. A client requesting to join, advance, or skip a queue cannot dictate state. The backend, operating with Service Role authority, evaluates the intent, applies concurrency locks, enforces scopes, and performs the mutation.

Endpoints resolving NFC tokens to physical routing behavior possess Service Role access to swiftly read unified tracking tables across circles. These endpoints must remain heavily validated to parse tokens deterministically without leaking sensitive operational data to unauthenticated scanners.

## Things Intentionally Avoided

To protect system integrity, Rifelo explicitly and intentionally avoids:

*   Direct frontend Service Role usage or exposing the configuration securely in the client bundle.
*   Bypassing RLS casually for developer convenience on standard authenticated CRUD operations.
*   Trusting client-provided `event_id` payloads without validating explicit admin ownership.
*   Allowing frontend-authoritative queue mutations or optimistic UI updates that dictate or presume database state.
*   Exposing privileged mutation APIs or detailed, privileged backend state to dumb booth displays or customer clients.
