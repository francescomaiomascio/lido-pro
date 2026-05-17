# Product Boundary

LidoPro is a proprietary commercial local-first application in active development / pre-release / private commercial readiness.

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

## Local-First Scope

Current workflows are local-first.

The application must remain useful without a hosted backend. LidoPro Desktop is the preferred local development runtime. Browser preview and browser development persistence are fallback paths only, while Android/native persistence is the intended mobile persistence path.

Local-first behavior does not imply third-party production use rights. Private/commercial release, customer deployment, and external evaluation require separate written authorization.

## Commercial Product Boundaries

The following names describe commercial roadmap boundaries, not live released capabilities unless explicitly implemented and released:

- **Lido Cloud**: cloud sync, accounts, customer portal, hosted booking, and multi-device operations.
- **Lido Pay**: external payment provider integrations and production payment processing.
- Online customer booking flows.
- Hosted dashboards.
- Public account/authentication layer.
- Production publishing/apply flow from Studio drafts to operational layout, unless explicitly implemented and verified.

## Public Claims To Avoid

Do not write public copy that says or implies:

- "download and use LidoPro in production";
- "book online";
- "pay online";
- "PayPal/Satispay/Stripe is available";
- "cloud sync is available";
- "customer portal is available";
- "production deployment is supported for all facilities";
- "repository access grants commercial use".

## Safe Positioning

Safe English positioning:

```text
LidoPro is a proprietary commercial local-first beach management application in active development / pre-release. It focuses on layout planning, local booking operations, customer records, pricing, and local account tracking, with commercial product boundaries for future cloud, account, customer portal, and payment modules.
```

Safe Italian positioning:

```text
LidoPro è un gestionale commerciale proprietario local-first per stabilimenti balneari, in sviluppo attivo / pre-release. Copre progettazione layout, prenotazioni operative locali, clienti, listino e contabilità locale, con confini commerciali per futuri moduli cloud, account, portale clienti e pagamenti.
```

## Protected Layout Boundary

The active operational layout is protected.

Studio drafts, base templates, and generated previews must remain distinct from the active layout until an explicit, verified publication flow exists.

## Legal Boundary

Repository visibility does not grant commercial use, redistribution, hosting, SaaS, white-label, resale, production deployment, customer deployment, payment/account/cloud operation, or brand/logo rights.
