# NFC System

## NFC Philosophy

The Rifelo NFC System serves as a frictionless bridge between physical presence and digital interaction. It is designed to aggressively reduce both social friction and access friction, allowing users to engage with complex digital environments simply by tapping their mobile devices. The physical-to-digital interaction philosophy treats the physical world as the trigger and the digital ecosystem as the experience, removing the need for manual data entry, app downloads, or complex login handshakes during ephemeral events.

## Dynamic Interaction Model

At the core of the Rifelo NFC architecture is a strict dynamic interaction model. Rifelo NFC tags are encoded uniformly with a dynamic gateway pattern:
`rifelo.id/t/[token]`

This is the most critical architectural decision in the hardware system. The backend dynamically resolves what this interaction entails. Behavior is **NOT** permanently flashed into the physical NFC chip. Because the token merely references a server-side configuration, the interaction behavior can be radically altered from the backend—instantly turning a profile-sharing tag into a queue-joining pass—without ever needing to physically touch or reflash the hardware tag. This decoupling guarantees extreme agility and operational simplicity.

## Tokenized Redirect Philosophy

The short URL token (`/t/[token]`) acts as a lightweight, agnostic interaction reference. 

*   **Server-Side Resolution:** When a device hits the URL, the backend evaluates the token, identifies its current assigned behavior, and issues the appropriate dynamic redirect.
*   **Flexible Interaction Control:** The payload of the interaction defines the user's destination, enabling contextual routing based on active business logic.
*   **Decoupling:** By abstracting the destination behind the token, Rifelo completely decouples the physical manufacturing and deployment of hardware from the evolving software business logic.

## NFC Ownership Model

The system utilizes a secure ownership model that links physical items to digital authority.

*   **Claiming NFC Tags:** Unactivated tags wait to be claimed. Once claimed via the platform, physical tags are digitally bound to a user, circle, or event.
*   **Server-Side Ownership Authority:** The database is the ultimate authority on who owns a token and what it does.
*   **Reassignment Philosophy:** Because the logic lives in the backend, ownership and behavior can be reassigned on the fly, rendering physical hardware independent of a single permanent owner.

## Interaction Modes

Because interaction behavior is dynamically configurable, a single NFC tag can assume multiple conceptual modes depending on server-side configuration:

*   **Profile:** Resolves to a specific user's public identity or digital business card.
*   **Redirect:** Acts as a shortened smart link to explicit external URLs.
*   **Photobooth / Event Queue:** Serves as a dynamic pass to instantly join a physical event queue.
*   **Circle:** Grants immediate access or an invitation to a specific community space.
*   **Future Extensibility:** The token model ensures that any new digital flow can be instantly mapped to existing field hardware.

## Hardware Philosophy

The hardware philosophy is defined by its commitment to absolute "dumbness." 

*   **Lightweight & Stateless Hardware:** Physical NFC hardware contains zero business logic, zero user data, and minimal configuration. It is completely stateless. 
*   **Replaceable:** If a physical tag is destroyed, a new one can be linked to the same token configuration instantly.
*   **Backend-Authoritative Control:** The intelligence of the physical interaction is entirely backend-authoritative. The tag simply says, "I am Token X." The server dictates everything else.

## Security Philosophy

Rifelo enforces a strict "zero trust on physical hardware" security model.

*   **No Sensitive Data Storage:** No personal, private, or authentication data is ever stored directly on the NFC tag.
*   **Backend Validation:** Extracting the URL from the tag provides no inherent privileges. The backend evaluates the token and enforces dynamic permissions upon request.
*   **Token Authority & Verification:** The server strictly verifies digital ownership and operational context before executing the interaction, rendering cloned tags functionally useless if the backend revokes the specific token's context.

## Failure & Operational Philosophy

The system embraces the chaotic reality of physical deployments.

*   **NFC Failure Tolerance:** Physical NFC chips degrade, break, or get lost. 
*   **Hardware Replacement Philosophy:** Because all value and logic are server-side, losing a physical tag means losing $1 of plastic, not a catastrophic loss of data or configuration. 
*   **Server-Side Recovery:** Admins can instantly invalidate a lost token, preventing abuse, and map the saved interaction configuration to a brand-new blank tag via the server dashboard.

## Scalability Philosophy

Scalability in the physical world is constrained by logistics. Rifelo's NFC architecture scales precisely by minimizing physical logistical touchpoints.

*   **Token Abstraction:** Millions of tags can be manufactured identically; they only gain unique purpose upon backend activation.
*   **Avoiding Reflashing Dependency:** The dynamic interaction evolution ensures that sweeping feature updates require zero physical hardware reflashes, keeping operational scaling frictionless.
*   **Centralized Interaction Control:** A single deploy action controls the interaction routing for thousands of deployed physical tags simultaneously.

## Things Intentionally Avoided

To preserve security, flexibility, and architectural purity, the NFC system explicitly avoids:

*   Hardcoded or static NFC interaction logic.
*   Storing any sensitive personal or business data directly on the physical NFC chip.
*   Hardware-authoritative business logic or access control.
*   Permanently static NFC behavior that requires physical reflashing to update.
*   Heavy on-device computation or complex app-based read/write validation.
*   Overengineered IoT synchronization or physical mesh-networking systems.
