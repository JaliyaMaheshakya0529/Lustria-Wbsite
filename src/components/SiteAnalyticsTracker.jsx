import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const KEY = 'lustria-analytics-session';

function getSessionId() {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, '');
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export default function SiteAnalyticsTracker({ path }) {
  const recordPageView = useMutation(api.analytics.recordPageView);
  useEffect(() => {
    if (path !== '/' && path !== '/collection') return;
    const id = getSessionId();
    if (id) recordPageView({ path, sessionId: id }).catch(() => {});
  }, [path, recordPageView]);
  return null;
}
