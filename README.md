# ISSA Parfums

A responsive perfume storefront and protected administration area inspired by the supplied black, navy and gold ISSA packaging. Bottle artwork is rendered in CSS; the supplied photograph is not bundled because its original file was unavailable in the workspace.

## Run

Requires Node.js 24 (uses built-in SQLite).

```sh
npm ci --cache /tmp/issa-npm
npm run dev
```

The development server listens on port 3000. For a production build:

```sh
npm run build
NODE_ENV=production npm start
```

Use HTTPS in production: administrator cookies are Secure in production mode. Configure a strong `ADMIN_PASSWORD` in your hosting environment, then visit `/admin`. There is no hard-coded administrator password. For local development, you can set it without putting it in shell history:

```sh
read -rs -p 'Admin password: ' ADMIN_PASSWORD
export ADMIN_PASSWORD
npm run dev
```

`PORT` defaults to 3000. `DB_PATH` defaults to `data/issa.sqlite`. Preserve the database on a persistent volume and back it up; restarting the server preserves data but ends administrator sessions. Never commit the database or credentials. There is no separate database service.

## Included

- Searchable catalogue, family filters, fragrance details, 30/50/100 ml sizes and stock availability.
- Persistent shopping bag, delivery details, server-calculated prices and cash-on-delivery orders with confirmation numbers.
- Bespoke family / signature note / size selection, saved with each order.
- Password-protected admin product creation/editing/deletion, pricing and stock; order management and status updates; homepage headline, subtitle and announcement editing.
- SQLite persistence, HttpOnly administrator sessions, login rate limiting, and validation of order items and prices.

## Validate

```sh
npm run build
npm test
```

Integration tests start an isolated server on port 3199 and use a temporary database. They exercise storefront delivery, catalogue, access controls, standard and bespoke orders, authoritative pricing, product CRUD, order status and homepage settings.

## Before accepting real orders

Replace all sample fragrances, prices, stock, brand claims and copy through the admin panel. Delivery currently costs $5, complimentary for orders of $100 or more; currency is USD. Orders are saved for manual confirmation, with payment on delivery. No card processing, SMS/email notifications, tax engine, or delivery-provider integration is configured. Bespoke prices are 30 ml $55, 50 ml $75, 100 ml $110. The current stock figure controls item availability; placing an order does not reserve or decrement stock automatically, so administrators should confirm availability before fulfilling orders. Google Fonts is optional; local system font fallbacks are provided. Review business contact information, delivery policy and privacy terms before a public launch.

## Deploy on Vercel with Turso

Vercel serves the Vite build and routes `/api/*` to the Node function in `api/index.mjs`. Use Node.js 24 in Vercel project settings. Local development still uses SQLite; Vercel **requires** durable remote storage and returns HTTP 503 rather than silently storing orders in temporary files when its database is not configured.

1. Create a Vercel account at https://vercel.com and a Turso account at https://turso.tech (GitHub sign-in is available).
2. In the Turso dashboard, create a database and obtain its database URL and an access token. Keep the token private.
3. Import this GitHub repository into Vercel. Keep the project root at the repository root, the Vite framework preset, build command `npm run build`, and output directory `dist`.
4. Before deploying, add these Vercel environment variables to the Production environment (also Preview if you use previews):
   - `TURSO_DATABASE_URL`: the database's `libsql://...turso.io` URL.
   - `TURSO_AUTH_TOKEN`: its secret database token.
   - `ADMIN_PASSWORD`: a strong, unique administrator password.
5. Deploy. If variables were added after a deployment, redeploy to activate them.
6. On the resulting HTTPS URL, check the collection, open `/admin`, sign in, edit a sample fragrance and verify it on the storefront. Place a test order, then confirm it appears in admin Orders. Check a bespoke order too. Remove or cancel your test orders before launch.

Tables and the initial sample catalogue are created automatically on first API use. Existing products and settings are preserved on subsequent deployments. Administrator cookies are signed so login works across function instances. Changing `ADMIN_PASSWORD` invalidates existing administrator cookies. Login throttling currently uses per-instance memory; configure Vercel Firewall rate limits for `/api/admin/login` before a public launch. A real Turso connection and public deployment require your accounts and have not been verified locally.

Store tokens only in Vercel's environment-variable settings, never in chat, frontend source, Git, or Vite-prefixed environment variables. Do not use `VITE_` for secrets. Configure Preview with a separate database if you want to isolate test orders from Production. The local SQLite database is not uploaded or migrated to Turso automatically.
