# Lustria Gem & Jewellery

Lustria is a React and Vite catalogue with WhatsApp inquiries, a Convex backend, and a password-protected admin area.

## Local setup

1. Use Node.js 24 and run `npm ci`.
2. Copy `.env.example` to `.env.local`. Set `VITE_CONVEX_URL` to your development deployment and `VITE_WHATSAPP_NUMBER` to the business number in international format with its country code.
3. Run `npx convex dev` and select the same development deployment. Set up Convex Auth there if needed. Keep `JWT_PRIVATE_KEY` and `JWKS` in the Convex deployment environment.
4. Run `npm run dev`. Open `/admin`, create an account, then copy the account ID on the Access Restricted screen. In the Convex dashboard, add it as a `userId` reference in the `admins` table.
5. Run `npm run lint`, `npm test`, and `npm run build` before deploying.

Available products appear in Collection. Mark up to four products as Featured to put them on the homepage. Hide an item to remove its public listing and detail page. Admin access is granted separately on each deployment.

See [deployment instructions](DEPLOY.md), [catalogue notes](INTEGRATION_NOTES.md), and [analytics details](ANALYTICS_FIX_README.md).
