# Project status after upgrade

## Implemented in this build
- [x] Preserved React + TypeScript + Vite and Express + TypeScript.
- [x] Emergency request fields: component, units, hospital, coordinates, deadline, urgency and requester phone.
- [x] Explicit demo/unverified status; unverified requests cannot trigger donor outreach.
- [x] Component-specific conservative compatibility rules and explainable donor ranking.
- [x] Eligibility, consent, recent confirmation, donation date, screening and location-confidence checks.
- [x] Leaflet map and synthetic weighted Dijkstra graph with timestamps, closures, rain scenarios and unreachable routes.
- [x] Mock SMS adapter, inbound payload validation, reply 1/2 parsing, deduplication and expiry checks.
- [x] Sequential outreach preview with configurable batch size and response timeout.
- [x] Simulated ambulance assignment with explicit dispatcher confirmation and deadline feasibility check.
- [x] Local draft queue, idempotency key header, retry after reconnection and connection status.
- [x] Role-token middleware, rate limiting, audit records and optional PostgreSQL request/donor/audit storage.
- [x] Tests for compatibility, ranking, Dijkstra, closures, weather, SMS validation/deduplication, expiry and concurrent demo donor acceptance.

## Not production-ready / incomplete integrations
- [ ] Live hospital identity verification and real requester onboarding.
- [ ] Real SMS provider, signature verification, delivery receipts and durable inbound deduplication.
- [ ] Live routable road data, traffic, weather, flood, landslide and closure feeds.
- [ ] Persistent ambulance inventory and transactional ambulance reservation.
- [ ] Full identity provider, user management and production RBAC.
- [ ] Production provisioning workflows for donors and ambulances.
- [ ] Browser login flow and secure authentication integration.
- [ ] End-to-end browser tests, provider integration tests and deployment-specific validation.

All real-world integrations are explicitly unconfigured. No real SMS or ambulance dispatch is performed by this build.
