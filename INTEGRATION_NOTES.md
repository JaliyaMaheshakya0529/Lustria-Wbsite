# Lustria: Admin-controlled collection integration

This project retains the original storefront layout and styles. The supplied Navbar.jsx and Navbar.css are used verbatim.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env.local` and set `VITE_CONVEX_URL` to your existing **development** Convex deployment URL.
3. Run `npx convex dev` and verify the deployment matches your `.env.local` URL.
4. In another terminal run `npm run dev`.
5. Open `/admin` and sign in with your existing approved account.

## How products work
- Add products via `/admin`. An **Available** product appears in `/collection` automatically.
- Turn on **Featured** to show it in the homepage Signature Creations section. Up to four newest featured products display.
- Turning off Available hides a product from both public sections, without deleting it.
- Deleting a product removes it from both sections. Price, image, name, metal, category, and gemstone are read from Convex.
- The uploaded source archive had placeholder products hardcoded into the two sections. These have been replaced with real Convex data; the storefront may initially show an empty collection until you add products in the admin panel.
- The admin dashboard's Featured counter shows all featured products, even if only four fit the homepage showcase.
- This package does not import the old Unsplash placeholder products into your database.

## Files changed
- `src/components/Navbar.jsx`, `src/styles/Navbar.css`: exact newly supplied navbar versions.
- `src/main.jsx`: Convex Auth provider for admin and public queries.
- `src/App.jsx`: protected `/admin` page routing.
- `src/pages/Collection.jsx`: Convex data in existing collection card/filter UI.
- `src/components/SignatureCreations.jsx`: featured Convex products in existing card UI.
- `convex/products.ts`: stable ordering for public products.

All other existing UI components and styles were left unchanged. This package does not include `node_modules`, local environment secrets, or build output.
