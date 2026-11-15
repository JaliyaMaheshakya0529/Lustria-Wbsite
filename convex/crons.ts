import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("purge expired page views", { hours: 1 }, internal.analytics.purgeExpired, {});
export default crons;
