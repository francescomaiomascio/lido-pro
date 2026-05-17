# Public Repository Policy

The repository can be prepared for public/source-available visibility, but LidoPro remains proprietary commercial software.

## Repository Meaning

A public/source-available repository means:

- source code is visible;
- technical documentation is visible;
- development history can be reviewed;
- local development and build commands are documented.

It does not mean:

- LidoPro is open source;
- production use is authorized;
- commercial use is authorized;
- the product is generally released to customers;
- cloud services are live;
- payment integrations are live;
- customer portals are live;
- production deployments are supported;
- hosting/SaaS/white-label/resale rights are granted;
- trademark/logo/brand rights are granted.

## Do Not Commit

Never commit:

- `.env` files;
- API keys;
- signing keys;
- deployment credentials;
- payment provider credentials;
- real customer data;
- real booking data;
- real account/payment data;
- SQLite database files containing private data;
- JSON backups containing private data;
- screenshots with sensitive operational information;
- private business names or family references that are not intended for publication;
- generated native build artifacts;
- generated web bundles;
- local absolute paths in documentation when avoidable.

## Required Pre-Publication Hygiene

Before making the repository public, run a dedicated public repository hygiene pass.

That pass should check:

- git tracked files;
- untracked files;
- ignored files that may still be copied elsewhere;
- docs and screenshots;
- SQLite files;
- export/backup JSON files;
- Android signing material;
- `.env` and local config files;
- hard-coded URLs or credentials;
- private names;
- license and asset provenance;
- proprietary/source-available license boundary;
- commercial and trademark documents.

## Product Claims Policy

Public README/docs must clearly state:

- LidoPro is proprietary commercial software;
- the repository is source-available, not open source;
- commercial use requires written permission;
- the app is local-first and in active development / pre-release;
- cloud/payment/account features are commercial roadmap boundaries unless explicitly implemented;
- the active operational layout is protected from Studio drafts;
- base layout templates are drafts, not production activation.

## Safe Repository Description

Use:

```text
LidoPro is proprietary commercial local-first beach management software in active development. The repository is source-available for transparency, portfolio review, technical review, and evaluation. It is not open source.
```

Avoid:

```text
Production-ready cloud beach management platform.
```
