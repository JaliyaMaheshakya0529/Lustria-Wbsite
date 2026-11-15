# Deploy Lustria with Convex and Netlify

1. Use Node.js 24. Run `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
2. Verify the development environment first. Configure production Convex Auth with `JWT_PRIVATE_KEY` and `JWKS` as needed, then deploy the backend with `npx convex deploy`. The updated frontend requires the new catalogue and admin functions.
3. In Netlify, set `VITE_CONVEX_URL` to the production Convex deployment URL in both the **Builds** and **Functions** scopes. The Edge Function uses the Functions value to check product routes and set their HTTP status and metadata.
4. Set `VITE_WHATSAPP_NUMBER` in the **Builds** scope to the customer-facing business number, including the country code. The inquiry links are shown when this number is configured.
5. Deploy the frontend. Sign in at `/admin` and approve the account by adding its user ID to the production deployment's `admins` table.
6. Check direct loads of `/collection`, `/about`, `/admin`, and an available product. Check that a missing page and a missing or hidden product return HTTP 404 on Netlify, and verify that an inquiry opens the correct WhatsApp conversation. In the development deployment, verify publishing and editing a product, replacing an image, and viewing analytics.

The frontend build generates route-specific HTML metadata for the static pages and a branded `404.html`. Product metadata comes from Convex through the Netlify Edge Function on direct requests. During a Convex outage, the edge serves the storefront shell so a temporary lookup failure does not produce a false 404.

Keep authentication secrets out of `VITE_` variables.
