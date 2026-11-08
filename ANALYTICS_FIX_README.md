# Lustria Analytics — Working Files

This patch was prepared from your uploaded `Lustria-Wbsite(2).rar` project.

## What is fixed

- **Analytics no longer crashes the entire admin.** The analytics query now lives in an isolated React error boundary. If `analytics:overview` is not deployed, the Products tab and background uploads remain accessible; an analytics-specific message offers Retry.
- **Dashboard appearance is preserved** when analytics is working: same KPI cards, bar chart and most-visited-pages section. The product manager, login and upload queue are otherwise untouched.
- **30-day analytics query prioritizes the newest traffic**, even when the 10,000-event display limit is reached.
- Existing `SiteAnalyticsTracker.jsx` and `App.jsx` already record visits. They are not modified. No public storefront component or CSS file was changed.

## File replacements

Copy these **complete** replacement files from this patch into your project:

1. `src/pages/Admin.jsx`
2. `convex/analytics.ts`
3. `convex/schema.ts` (identical to uploaded version; included so you have a matching schema)
4. `SYNC_ANALYTICS_WINDOWS.cmd` (new helper in project root)

Do **not** replace your `.env.local`, `src/App.jsx`, the navbar, homepage or any public CSS.

## Important — deploy to your existing project

The screenshot of your Convex dashboard confirms the `analytics` functions are **not deployed** yet. Installing React files locally cannot create cloud functions by itself. Deployment must happen using your own Convex login.

1. Copy these files to the **same Lustria project folder** in VS Code, not a nested or older copy.
2. Double-click `SYNC_ANALYTICS_WINDOWS.cmd` in that folder. It runs `npx convex dev --once --verbose` **from its own folder**, using your existing `.env.local` development deployment.
3. Do not close the window on errors. Fix the first error shown; retry. If prompted, sign in with the Convex account that owns this deployment.
4. The script should print `SUCCESS: Analytics functions are included in generated API types.`
5. In the Convex dashboard for `curious-bird-179`, go to Functions and confirm `analytics` with `overview` and `recordPageView`. In Data, the `sitePageViews` table should exist.
6. Open the homepage and Collection page to record real test views, then refresh `/admin` and select Dashboard.

### Manual terminal alternative

```bat
cd /d "C:\path\to\your\Lustria-Wbsite"
npm install
npx convex dev --once --verbose
```

Verify the `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL` values in `.env.local` point to the **same deployment** shown in the dashboard. Don't run `npx convex deploy` here: that targets production.

### If the dashboard still says function not found

- Read the **terminal output** from the sync script. A server or TypeScript failure can stop deployment; repeated browser refreshing cannot fix it.
- Verify that `convex/_generated/api.d.ts` now includes `import type * as analytics from "../analytics.js";`. The uploaded file listed only `products`, proving it was stale.
- Make sure you run the script from the project that Vite serves. You may have more than one copy of Lustria on your computer.
- If the terminal specifically reports duplicate authentication configuration, keep your existing `convex/auth.config.ts` and remove the redundant `convex/auth.config.js` after backing it up; do not change the auth provider settings.
- Make sure the backend was pushed to `curious-bird-179` (not another dev or production deployment).

## How counting works

A nonvisual `SiteAnalyticsTracker` calls `analytics:recordPageView` when a visitor navigates to Home (`/`) or Collection (`/collection`). Each event stores the path, anonymous per-tab session identifier and timestamp. The backend ignores repeat views to the same page within 30 seconds per tab. `analytics:overview` requires an authenticated user in the `admins` table, aggregates the latest 30 days and returns statistics to Dashboard. It does **not** use Google Analytics or reconstruct older visitors. Localhost visits also count while testing.

**Limitations**: visitor count is approximate tab sessions, not unique people; analytics is capped at the newest 10,000 events for reporting; no sales or traffic-source data is included. The tracking code itself does not store IP, email or user agent.

**Privacy**: use appropriate privacy disclosures before public production use of any analytics tracking.

## Verification status

Code was checked against the uploaded project files. This environment is **not authenticated to your Convex account**, so the new functions cannot be pushed from here and the cloud dashboard cannot be verified. The script is the required deployment step on your Windows computer.
