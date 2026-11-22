# SkyFire Education Hub — Architecture and Controls

## Purpose

A non-sensitive, functional learning application to establish product behavior and demonstrate instructor, learner, and administrator workflows for surface and underground mining contexts.

## Prototype layout

- `index.html`: application shell and entry point.
- `src/styles.css`: responsive presentation patterned after the current SkyFire Safety Library design.
- `src/seed.js`: fictional sites, workforce, courses, lesson content and assessment items.
- `src/store.js`: JSON state storage adapter with per-browser persistence and export/reset.
- `src/app.js`: application UI, simulated role switching, workflows, presentation mode, assessments, and exports.
- `assets/skyfire-mark.svg`: local fallback logo. The prototype references the published Safety Library logo to maintain family resemblance.

There are **no credentials, API keys, authentication flows, real employee data, or production endpoints**.

## Deliberate boundaries

The prototype's localStorage state is untrusted. Any browser user can inspect, manipulate, or replace all data. Demo roles are only presentation modes. The app has no real authorization, signature, audit trail, or reliable record retention. No compliance claims should be made on the strength of this demo.

## Production-shaped evolution

Before production adoption, evaluate building on or integrating with an established LMS such as Moodle. Do not assume a fully custom solution is the right architecture. Prototype lesson and assessment models are exploratory and may change.

If a custom/hybrid architecture is selected, design independently deployed services for:

1. Authentication and identities (MFA; lifecycle provisioning and deprovisioning).
2. Scoped authorization (operator, company, site, employment/contractor relationship, approved instructor and evaluator roles).
3. Course and version management, media storage, learning events and assessment attempts.
4. Reliable transactional training and evaluation records with unique identifiers and attribution.
5. Separate regulatory training-plan mapping and authorized certification, including approved equivalent-form / 5000-23 workflows where applicable.
6. Immutable or tamper-evident event history, retention and legal hold controls, backup/recovery, exports, security monitoring and incident response.
7. Training validity rules by operation type, applicable Part 48 provisions, contractor arrangements, site hazards, and actual operator policies.

## Operational gates

Before any real records are collected or used to make training decisions:

- Verify the applicable Part 48 requirements for each operation, approved training plan, instructor approval status, and contractor responsibilities.
- Define accountable company data ownership, identity proofing, instructor/evaluator privileges, record access, export, record retention, and separation on vendor exit.
- Implement secure server-side access controls and reliable cross-device transactions.
- Perform threat modeling, third-party dependency reviews, accessibility testing, backups/recovery exercises, load testing and independent security review.
- Conduct actual operator acceptance and compliance testing. Maintain approved backup recordkeeping until full adoption is authorized.

## Current known gaps

No shared database; no real login or permissions; no encryption key management; no certification authority; no validated content approval; no scenario scoring beyond simple choices; no multimedia upload/encoding; no actual Part 48 compliance engine; no 5000-23; no offline sync; no production service monitoring.
