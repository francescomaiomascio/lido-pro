# Product Boundary

LidoPro is a proprietary commercial operating platform for beach establishments.

The current implementation is local-first and operator-focused. Local-first is the current deployment/runtime posture, not the full product boundary.

This document separates implemented local capabilities from commercial product boundaries so public documentation does not overstate release status or grant rights.

## Implemented Local Scope

Current local application capabilities include:

- local beach layout and map operations;
- Lido Studio planning/sketch work in progress;
- local booking/reservation workflows;
- local customer registry and assignments;
- local account ledger foundations;
- local payment records for internal bookkeeping;
- tariff/catalog foundations;
- LidoPro Desktop shell through Tauri v2 for macOS development;
- Android packaging through Capacitor;
- SQLite-backed local persistence with browser development fallback.

## Current Runtime Scope

Current workflows are local-first and operator-focused.

The application must remain useful without a hosted backend. LidoPro Desktop is the preferred local development runtime. Browser preview and browser development persistence are fallback paths only, while Android/native persistence is the intended mobile persistence path.

Local-first behavior does not imply third-party production use rights. Private/commercial release, customer deployment, and external evaluation require separate written authorization.

## Commercial Platform Boundaries

The following names and capabilities describe commercial roadmap boundaries, not live released capabilities unless explicitly implemented, configured, reviewed, and released:

- **Lido Cloud**: cloud sync, account/customer login, customer portal, hosted booking, and multi-device operations.
- **Lido Pay**: external payment provider integrations, real transactions, and production payment processing.
- **Customer booking portal**: public or private customer-facing booking flows.
- **Hosted operation / SaaS**: hosted dashboards, managed deployments, white-label delivery, and reseller operation.
- **Intelligent assistant**: AI-assisted parametric editing, operational help, or automation.
- **Studio publication flow**: production publishing/apply flow from Studio drafts to operational layout, unless explicitly implemented and verified.

## Public Claims To Avoid

Do not write public copy that says or implies:

- "download and use LidoPro in production";
- "book online";
- "pay online";
- "PayPal/Satispay/Stripe is available";
- "cloud sync is available";
- "customer portal is available";
- "AI assistant is available";
- "production deployment is supported for all facilities";
- "repository access grants commercial use".

## Safe Positioning

Safe English positioning:

```text
LidoPro is a proprietary commercial operating platform for beach establishments. The current implementation is local-first and operator-focused, with commercial platform boundaries for future cloud synchronization, customer portal, real payments, account login, hosted booking, multi-device use, and intelligent assistance.
```

One concise Italian positioning line may be used when appropriate:

```text
Gestionale operativo per stabilimenti balneari: progettazione, mappa operativa, prenotazioni, clienti, articoli, conti e servizi.
```

## Protected Layout Boundary

The active operational layout is protected.

Studio drafts, base templates, and generated previews must remain distinct from the active layout until an explicit, verified publication flow exists. Studio drafts must not mutate operational, customer, reservation, or account data directly.

## Legal Boundary

Repository visibility does not grant commercial use, redistribution, hosting, SaaS, white-label, resale, production deployment, customer deployment, payment/account/cloud operation, intelligent-assistant operation, or brand/logo rights.
