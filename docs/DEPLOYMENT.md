# Vercel deployment

## Deployment settings

Import `sentinelstechnologygroup-stack/Hidden-Lake-Distillery` as a Vercel project. Use the repository root, Vite preset, Node 24, `npm ci`, `npm run build`, output `dist`. `vercel.json` routes all `/api/*` requests to the Node function before the SPA fallback. Keep Preview deployments protected while owner placeholders are present.

Provision a dedicated PostgreSQL database and apply its recommended pooled/TLS connection URL. Use separate databases or branches for Preview and Production. Do not reuse an unrelated client's database or production customer data in previews.

Set server variables DATABASE_URL, BETTER_AUTH_SECRET (random, at least 32 characters), and BETTER_AUTH_URL (the exact stable HTTPS preview or production origin). Auth origins must match the browser URL; use a stable preview domain rather than trusting every `*.vercel.app` origin. Never put these values in VITE_ variables or Git.

Set RESEND_API_KEY and EMAIL_FROM for a verified sender; optionally CONTACT_EMAIL to queue an owner notification for inquiries. Authentication messages are queued and immediately attempted when delivery is configured. Failed messages remain queued with retry timing; use an authenticated scheduler calling GET `/api/cron/mail` with `Authorization: Bearer <CRON_SECRET>` every minute. The endpoint accepts no user data and never returns message contents. If a scheduler is not configured, run `npm run mail:flush` privately. The administrator inbox remains the source of truth for contact submissions.

Set BLOB_READ_WRITE_TOKEN from a dedicated public Vercel Blob store to enable product-image uploads. The admin API enforces authorization, a 3 MB limit and PNG/JPEG/WebP file signatures. SVG/HTML uploads are rejected. Images are public; never upload customer documents to this store.

With environment variables loaded privately, run:

```sh
npm run db:migrate
npm run db:seed
```

Do this before opening the preview. Run migrations once as a controlled release task, not on every serverless invocation. The schema includes Better Auth's maintained tables, and versioned commerce SQL. The user administration command requires a verified account. Set VITE_SITE_URL only after the public domain is confirmed.

## Preview verification

Verify `/api/health`, home, spirits, direct product URLs, favicon, cocktails and mobile menu. Register two separate accounts, receive verification email, log in/out, reset a password, save/edit/default/delete addresses and demo payment methods, complete pickup and shipping demo orders, revisit history and cancel a demo order. Verify account A cannot access account B's data. Verify regular accounts cannot reach admin mutations. Review pending testimonials in admin, publish one, and submit/resolve a contact inquiry.

Verify real HTTPS cookies and CSRF behavior on the final host, email delivery/retry, and image upload with the provisioned store. The code tests cannot establish connectivity to an unconfigured production database, sender, or Blob store.

## Commerce handoff still required

Justin confirmed Poynt by GoDaddy as the POS. Commerce is outside the current distributor-website scope. There is deliberately no live charge, invented shipping authorization, tax quote, stock reservation, or fulfillment promise. Existing orders have an enforced demo-only database constraint; configuration cannot accidentally turn these into paid purchases.

The selected provider must supply hosted/tokenized payment setup, authenticated webhook signatures with replay protection and event deduplication, real inventory reservations, refunds, tax calculation, destination/product eligibility, verified age checks, adult-signature fulfillment, pickup ID checks, and approved customer notifications. Extend the payment-method table only with provider references from trusted server-to-server events. Never accept real card details or a browser-supplied payment success flag.

Before public launch: replace every XXXX/sample claim and image, approve business/license disclosures and policies, test backups/restores, set retention policies, enable monitoring, replace the noindex model settings deliberately in HTML/robots/Vercel headers, generate a verified sitemap, and validate ad/analytics consent. Demo actions must never emit purchase/revenue conversions.

## Rollback

Promote a previously verified Vercel deployment only against a compatible schema. Back up PostgreSQL before applying future destructive migrations. Keep this initial migration additive; seeds never overwrite administrator edits. Rotate secrets privately if they are exposed, and revoke customer sessions after auth-secret changes.

## Distributor relaunch release

Keep COMMERCE_ENABLED and VITE_COMMERCE_ENABLED false (omitted also means false). Public account/signup/checkout/order routes redirect to /distribution, legacy product URLs redirect to /spirits, and server order creation/payment mutation/signup are rejected. The legacy sample catalog is visible only to admins while commerce is off. Staff sign-in remains available through /admin.

Apply migrations 001 and 002 with `npm run db:migrate` against the configured database. The new /api/distributor-inquiries endpoint saves consent, company, territory, inquiry type, interest and message into the existing inquiries table. Admin follow-up supports new, contacted, reviewing and resolved, plus notes. Notifications still require the email provider and scheduler documented above.

The pre-release hosted /api/health check returned 503, backend configuration incomplete. Public pages do not depend on that service, but distributor/contact submissions require DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL and completed migrations. Until connected, forms display an explicit unavailable message; no success is simulated.
