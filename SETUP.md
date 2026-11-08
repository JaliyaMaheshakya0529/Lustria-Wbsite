# Lustria admin analytics update

Replace exactly these 6 files in your existing Lustria project:
- src/pages/Admin.jsx
- src/styles/Admin.css
- src/App.jsx
- src/components/SiteAnalyticsTracker.jsx (new)
- convex/schema.ts
- convex/analytics.ts (new)

## Setup
1. Back up your current project first.
2. Copy the files into the same paths, keeping all other files unchanged.
3. Run `npx convex dev` to deploy the new `analytics` functions and schema to your development deployment.
4. In a second terminal run `npm run dev` and open `/admin`.
5. Open the public homepage and collection page in a different tab to record page views. They appear in Dashboard in near real time.

## What changed
- Dashboard now shows real website page-view analytics (today, 7 days, 30 days, approximate unique tab sessions, daily chart, top pages). It no longer shows products.
- Products sidebar shows the product manager, with 3 rows per page to prevent overlap on short desktop screens.
- Existing background upload queue, featured toggles, product editor and admin authentication are preserved.
- No changes to public website appearance, navbar, collection or signature cards.

## Analytics caveats
- New tracking only: old visits cannot be reconstructed.
- Page views are not orders or sales; unique sessions are not guaranteed unique people.
- Anonymous session identifiers are stored in sessionStorage per tab. No email/IP/user agent is stored by the tracking code.
- Admin visits are excluded. Only `/` and `/collection` are tracked.
- 30-day query is capped at 10,000 events and warns if capped. High-traffic sites should move to aggregated analytics.
- Data remains in Convex unless you set up a retention cleanup policy.
- Localhost visits count too; for production reporting, restrict tracking to the production domain in SiteAnalyticsTracker.jsx.
