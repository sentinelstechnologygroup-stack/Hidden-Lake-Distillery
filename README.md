# Hidden Lake Distillery

Producer website for Hidden Lake Distillery in Kalispell, Montana, featuring Whitefish Handcrafted Spirits and Copper Pirates. Cloned from Copper-Pirates with its Git history preserved.

## Current website

The site promotes the distillery and distributor inquiries. The Products page leads to dedicated /spirits/whitefish and /spirits/copper-pirates brand pages. Whitefish displays 13 supplied bottle photographs with category filters; Copper Pirates displays the owner-supplied front bottle visualization, labeled as a packaging concept. Product-specific links prefill the distributor inquiry message. The homepage restores the original cinematic distillery atmosphere, with distinct cream/forest Whitefish and charcoal/copper Copper Pirates presentations. Current expression availability, specifications and trade terms are confirmed directly. No public pricing, shopping, liquor sales or merchandise checkout is offered. Frontend commerce is disabled; keep COMMERCE_ENABLED false on the server.

Business details come from Justin Meccia’s October 18, 2026 email: Hidden Lake Distillery is owned and operated by Table 62 LLC (Montana DSM license holder), at 2134 US Hwy 2 E., Kalispell, MT 59901. Public contact: distillgrillchill@gmail.com. Poynt by GoDaddy is the current POS; no POS integration is needed for this scope.

Distributor/contact forms require the configured API/database below. A direct email link remains available independently. Preview indexing stays disabled pending owner review. See docs/ASSETS.md for supplied asset provenance and remaining content questions.

## Brand assets

The refined owner-supplied Hidden Lake logo is public/images/hidden-lake-logo-master.png (transparent master) and public/images/hidden-lake-logo.png (trimmed web export). The shared BrandMark applies the site copper tint in CSS and appears in the header, footer, homepage seal and age confirmation. Favicons use the complete owner-supplied logo image unchanged except for export sizing (public/images/hidden-lake-favicon-source.png), with PNG sizes 16/32/48/192/512, favicon.ico, a 180px Apple touch icon and site.webmanifest.

## Signature drinks and policy review

/cocktails presents the 14 supplied signature drinks with ingredient lists and zero-proof options. /policies/privacy, /policies/terms and /policies/responsible contain expanded owner-review drafts. Policy pages are accessible without age confirmation. See [compliance review](docs/COMPLIANCE-REVIEW.md) for verified sources and unresolved launch requirements; these pages do not certify regulatory compliance. The owner confirms a retail/bar license as well as the DSM license; exact privileges still require document review.

## Run locally

Requires Node 24 and PostgreSQL 16 or later.

```sh
npm ci
cp .env.example .env
# Fill DATABASE_URL and a random BETTER_AUTH_SECRET in .env.
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:5173. Vite forwards `/api` to the local server on 127.0.0.1:3001. Use this same exact origin in BETTER_AUTH_URL. Migrations are an explicit deployment step, never part of a build or public HTTP request. Seeds insert sample products only and preserve existing products.

For a self-contained development database, run `npm run db:dev` in another terminal; it listens on 127.0.0.1:5433 and persists in `.dev-db`. Set DATABASE_URL to `postgresql://postgres:postgres@127.0.0.1:5433/postgres`. This development database has no network authentication: keep it loopback-only, never deploy it.

## What works

- Verified email registration, login, password recovery/reset, logout, password changes, verified email changes, session listing/revocation, account deletion and demo-order anonymization.
- Editable customer profiles, saved shipping/billing addresses, persistent demo payment methods with default/removal controls. No card numbers or CVVs are collected or stored.
- Server-priced demo checkout, owner-protected order history/details, cancellation, transactional idempotency and immutable item snapshots.
- Admin catalog editing/archiving, authenticated image uploads, review moderation/manual entry, inquiry inbox, demo order management and audit history.
- Persistent shared rate limits, same-origin mutation checks, validation, secure session cookies on HTTPS, no-store private responses, versioned database migrations.

Email verification and resets use a persistent mail outbox. Configure RESEND_API_KEY and EMAIL_FROM to deliver email. Without delivery configured, the developer can inspect queued links using the **local-only** `npm run mail:dev` command. Never expose that command or its output in public logs or an HTTP endpoint. Admin roles cannot be granted from signup or a browser request:

```sh
npm run admin:grant -- owner@example.com
```

The owner must first register and verify that account. The grant revokes existing sessions; sign in again.

## Validate

```sh
npm run check
npm audit
npx playwright install chromium
npm run test:browser
```

API integration tests use real Better Auth handlers, cookies and SQL through an isolated PGlite PostgreSQL engine. CI repeats them against PostgreSQL 17 via TEST_DATABASE_URL. No mock authentication is used. Tests cover verification/logout/reset/deletion, account isolation, role escalation, admin mutation, pricing, duplicate requests, availability, moderation, inquiries, and origin rejection.

See [deployment instructions](docs/DEPLOYMENT.md) and [migration status](docs/HARDENING-AND-MIGRATION.md). Vercel serves the static frontend and `api/index.mjs` function. The server also runs on any Node host with PostgreSQL.
