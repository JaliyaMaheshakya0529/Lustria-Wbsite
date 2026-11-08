# Deploy Lustria with Convex and Netlify

1. In the project root run `npm install` then `npx convex dev` to verify your dev deployment.
2. Configure Convex Auth once for the correct deployment; check `JWT_PRIVATE_KEY`, `JWKS`.
3. Run `npm run build`.
4. Deploy Convex with `npx convex deploy` and follow the CLI prompts for production.
5. In Netlify environment variables, set `VITE_CONVEX_URL` to the PRODUCTION Convex URL.
6. Push the source / trigger a Netlify deploy, then sign in to `/admin` and approve the user in the production deployment's `admins` table.
7. Verify public `/collection` and `/admin`, including hard refresh.

The source includes Netlify SPA fallback routing. Do not expose Convex signing secrets or authentication signing keys in a VITE_ prefixed variable.
