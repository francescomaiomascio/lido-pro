# Repository Hygiene

This repository may be public/source-available, but LidoPro is proprietary commercial software.

## Can Be Committed

- source code;
- product documentation;
- architecture notes;
- development fixtures that are clearly fictional or generic;
- curated assets with known rights;
- build configuration;
- placeholder examples without secrets.

## Must Never Be Committed

- `.env` files with real values;
- API keys, tokens, passwords, private keys, certificates, signing keys, keystores, or provider credentials;
- real customer, booking, account, payment, or business data;
- production SQLite databases;
- private JSON backups or exports;
- screenshots with customer, booking, account, payment, or establishment details;
- Android/iOS release artifacts;
- local absolute paths when avoidable;
- private business/family notes not intended for publication.

## Local Database Handling

Local SQLite databases are development/runtime artifacts. Do not commit `.db`, `.sqlite`, or `.sqlite3` files. Test/demo data must be fictional and documented as such.

## Screenshot Policy

Screenshots intended for docs or README must not contain real customer names, phone numbers, emails, booking records, payment status, private establishment data, desktop notifications, local file paths, or credentials.

## Generated Assets And Builds

Do not commit generated web bundles, Android release packages, iOS release packages, or native build outputs unless a release process explicitly requires a specific artifact and the commercial boundary has been reviewed.

## Environment Variables

Use `.env.example` for placeholders only. Never commit real environment files. Do not invent fake provider credentials in examples.

## Backup And Export Policy

Backups and exports may contain private business data. Keep them out of the repository. If a fixture is needed, create a minimal fictional fixture and label it clearly.

## Public Push Checklist

Before a public push:

- run the public release checklist;
- scan for secrets and real data;
- verify docs do not claim live cloud/payment/account/customer portal features;
- verify commercial source-available boundaries are present;
- verify LidoPro brand assets are reserved;
- verify no production/customer deployment rights are implied.
