# Website analytics

The dashboard reports the previous 30 calendar days, including today, in Sri Lanka time. It tracks Home, Collection, About, and available numbered product pages. Unique sessions approximate browser tabs. The collector stores paths, timestamps, anonymous session IDs, and a product name when applicable. Historical views remain counted after a product is removed from the catalogue.

Tracking deduplicates repeat views of the same path and session within 1.5 seconds and caps intake at 30 events per session per minute and 40 events per second sitewide. Raw views are retained for 90 days. The dashboard uses the newest 10,000 events in its reporting window and displays a notice if that limit is reached. Local visits that point to the same Convex deployment count in that deployment.

If reporting is unavailable, check that the frontend points to the intended Convex deployment and that `analytics:overview` and `analytics:recordPageView` are deployed. Check the Convex logs if the dashboard continues to fail. In an existing development project, `npx convex dev --once` syncs the backend from the project root. See [deployment instructions](DEPLOY.md) for production.
