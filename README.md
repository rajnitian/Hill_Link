# HillLink

**Emergency blood donor and transport coordination prototype for hilly regions.** This repository preserves the React + TypeScript + Vite client and Express + TypeScript server. It is a synthetic-data demonstration, not a clinical or emergency dispatch system.

## What is implemented

- Mobile-responsive dashboard, request form, demo donor directory, explainable candidate ranking, Leaflet map and offline draft queue.
- Request fields for blood group, component, units, hospital, coordinates, arrival deadline, urgency and requester phone.
- Demo request labels and a hard block on outreach for unverified/demo requests.
- Conservative component-specific compatibility rules; recent eligibility, consent, availability, health-screening status, donation date and location confidence are checked separately. Qualified blood-bank personnel must confirm suitability.
- Weighted Dijkstra routing on a small synthetic road graph, road-type speeds, rainfall multipliers, closed/unsafe edge exclusion, ETA/distance/timestamp and unreachable-route handling.
- Mock SMS adapter, validated inbound reply parser, deduplication, expiry checks and batch-preview state. No real SMS delivery is implemented or claimed.
- Explicit dispatcher confirmation guard for simulated ambulance assignment; no live dispatch provider is connected.
- Rate limiting, role-token middleware for non-demo environments, request cancellation, audit writes and an optional PostgreSQL JSONB store.
- Unit tests for compatibility, matching explanations, Dijkstra, road closures, weather adjustment, SMS parsing/deduplication and concurrent demo donor acceptance.

## Important limitations

- All bundled donors, ambulances and requests are synthetic. Do not enter real patient or donor data into the demo.
- The bundled road graph is fictional and geographically illustrative. Leaflet uses OpenStreetMap tiles, but the drawn route is **not** a live OpenStreetMap road route. No live traffic, weather, landslide or road-closure service is configured.
- The weather service is an adjustment interface with synthetic scenarios, not a live feed.
- `SMS_MODE=mock` creates message previews only. The `live` setting deliberately uses an unconfigured adapter that refuses delivery. Provider-specific outbound SMS, signed webhook verification, provider delivery receipts, donor phone provisioning and real confirmation SMS still need a reviewed provider adapter.
- Inbound SMS handling only applies to requests marked verified and non-demo. Reply `1` records interest but does not reserve a donor; an authorized dispatcher/hospital role must explicitly confirm acceptance through the confirmation endpoint. The phone-to-donor mapping must be populated through a secure production donor directory. Duplicate-message memory is process-local; production should persist provider message IDs with a unique database constraint.
- Hospital verification is not integrated. Demo requests cannot be verified via the demo role. An authorized administrator can record manual verification only when `HOSPITAL_VERIFICATION_MODE=manual-reviewed`; that setting is not a substitute for a real verification workflow.
- The optional PostgreSQL store persists request, donor and audit JSON records. It does not automatically seed production donor or ambulance data. Populate production records through a reviewed administrative process. Ambulance inventory is currently synthetic/in-memory and must be replaced with a persistent provider-backed inventory before production.
- Role authentication is a simple environment-token prototype, not a full identity provider, user lifecycle or fine-grained policy engine. The browser UI is designed for demo mode; production needs an approved login/token flow.
- Local draft storage is browser `localStorage` on the current device. Offline submission is queued and retried when connectivity returns; it does not make map tiles, live routing, weather or server APIs work offline. Keep real sensitive information out of local browser storage.
- No ambulance is actually dispatched. No real donor alert is sent. Do not use HillLink to manage real emergencies. Contact local emergency services and licensed healthcare providers.

## Requirements

- Node.js 20+
- npm
- Network connectivity for dependency installation and OpenStreetMap tiles
- Optional PostgreSQL for persistent server storage

## Run in demo mode

From the repository root:

```bash
cp .env.example server/.env
npm run install:all
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`). The API runs at `http://localhost:4000`. The application defaults to demo mode and uses synthetic in-memory records when `DATABASE_URL` is not configured.

## Build and tests

```bash
npm run build
npm test
```

## PostgreSQL configuration

Set `DATABASE_URL` to a PostgreSQL connection string. The server creates these tables on first database access:

- `hilllink_requests (id, data JSONB, updated_at)`
- `hilllink_donors (id, data JSONB, updated_at)`
- `hilllink_audit (id, at, actor_role, action, request_id, details JSONB)`
- `hilllink_interests (request_id, donor_id, created_at)`

In production (`NODE_ENV=production`), the server refuses to start without `DATABASE_URL`. The database is not automatically seeded with real donors. Use a reviewed, authenticated administrative provisioning process; do not put donor phone numbers or patient details in source control, logs, or fixtures.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | API port (default `4000`) |
| `CLIENT_ORIGIN` | Comma-separated allowed browser origins |
| `NODE_ENV` | Set `production` only after configuring production services |
| `DEMO_MODE` | Defaults to demo mode outside production; set `false` for production review |
| `DATABASE_URL` | PostgreSQL connection; required in production |
| `DATABASE_SSL` | Set `true` only when TLS is correctly configured |
| `HOSPITAL_API_TOKEN` | Prototype bearer token for hospital role |
| `DISPATCHER_API_TOKEN` | Prototype bearer token for dispatcher role |
| `ADMIN_API_TOKEN` | Prototype bearer token for administrator role |
| `HOSPITAL_VERIFICATION_MODE` | Defaults to `disabled`; `manual-reviewed` enables admin-recorded verification only |
| `SMS_MODE` | `mock` by default; `live` still refuses delivery until a provider adapter exists |
| `SMS_WEBHOOK_SECRET` | Placeholder for provider webhook verification; replace with provider-specific signature validation |
| `SMS_BATCH_SIZE` | Candidate preview batch size (default `3`) |
| `SMS_RESPONSE_TIMEOUT_MS` | Response timeout before a later batch can be previewed (default `60000`) |
| `VITE_API_URL` | Client API base URL (default `http://localhost:4000/api`) |

Never commit `.env`, credentials, provider secrets, real phone numbers or real medical data.

## SMS provider setup

No provider is currently integrated. Implement a provider-specific `SmsAdapter`, validate the provider's actual webhook signature, store provider message IDs durably with a unique constraint, map normalized sender numbers to a secured donor directory, and test delivery receipts and retries before enabling a real provider. Do not treat the mock response as a delivered SMS.

## Maps, roads and weather

The client uses Leaflet with OpenStreetMap tile attribution. The server's Dijkstra implementation weights road edges by estimated time using road class, rainfall multiplier, and closure/unsafe flags. The bundled graph and scenario data are synthetic; the current route endpoint supports demo rainfall and closure scenarios. Integrate a real routable OSM-derived graph or routing provider and trusted weather/closure feed before relying on road ETAs. Always display source and timestamp, and do not use an unreachable or unsafe route.

## Deployment checklist

1. Run tests and both builds in CI.
2. Configure PostgreSQL backups, TLS, least-privilege DB access and migrations.
3. Replace prototype role tokens with an approved identity provider and audited RBAC.
4. Add real hospital/requester verification and donor consent/eligibility workflows.
5. Have qualified blood-bank staff approve all final component suitability.
6. Integrate and security-test SMS, road routing, weather and ambulance providers independently.
7. Add durable idempotency, inbound message deduplication, durable outreach timeouts, concurrent ambulance reservation transactions and production observability with redacted logs.
8. Complete clinical, legal, privacy, accessibility and security reviews before any real use.

## Project layout

```text
hilllink/
├── client/  # React + TypeScript + Vite + Leaflet
└── server/  # Express + TypeScript, routes, services, demo data and optional PostgreSQL store
```
