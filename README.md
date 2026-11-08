# Lustria website + Convex admin panel

This is the **full source project** from your uploaded Lustria archive, with admin-side fixes. Public storefront React components and CSS are preserved.

## Setup on Windows / VS Code

1. Extract the RAR archive. Open the `Lustria_Admin_Fixed` folder in VS Code.
2. Run `npm install` in the project root.
3. Copy `.env.example` to `.env.local`. Set `VITE_CONVEX_URL` to your actual Convex deployment URL. If your existing `.env.local` already works, keep it instead.
4. Run `npx convex dev`. If it asks you to authenticate or select a project, follow those prompts. This must point to the **same** deployment URL as `.env.local`.
5. If Convex Auth has not been configured on that deployment, run `npx @convex-dev/auth`, follow its setup, and ensure `JWT_PRIVATE_KEY` and `JWKS` are present in the Convex dashboard environment variables. Do **not** add those secrets to `.env.local` or commit them.
6. In a second terminal run `npm run dev`. Open `http://localhost:5173/admin`.
7. Sign up once, then copy the account ID shown on the Access Restricted page. In the Convex dashboard open **Data -> admins**, add a document with `userId` referencing that ID. Refresh `/admin` to continue.
8. Test Add Product, image upload, Edit, Hide, Featured and Delete. `npm run build` validates the Vite build on your machine.

## Files of interest

- `src/pages/Admin.jsx` - protected login and dashboard, product creation/editing/deletion/upload
- `src/styles/Admin.css` - admin-only styles
- `convex/products.ts` - public reads, admin mutations and permissions
- `convex/schema.ts` - products and administrator tables
- `convex/auth.ts`, `convex/auth.config.ts`, `convex/http.ts` - Convex Auth setup
- `src/main.jsx` - ConvexAuthProvider
- `src/App.jsx` - `/admin` route

## Deploying

The included `netlify.toml` and `public/_redirects` support `/admin` direct URLs on Netlify. Deploy Convex separately with `npx convex deploy` and configure the production Netlify `VITE_CONVEX_URL` to point to the production Convex deployment. Admin approval is **per deployment**.

## Notes and limitations

- `node_modules`, build output, and your private `.env.local` were intentionally excluded.
- Public visual components have not been redesigned. `SignatureCreations.jsx` remains hardcoded; selecting Featured in the admin saves that field but does not automatically update the homepage's static showcase.
- Source was checked for parse errors here, but live authentication, Convex write operations, and a full npm build could not be tested in this environment because npm dependency installation was unavailable. Verify locally before publishing.
- Anyone may create an account, but only IDs added to `admins` can manage products.
