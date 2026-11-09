import { useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

const SESSION_KEY = 'lustria-analytics-session'
function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, '')
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch { return null }
}

export default function SiteAnalyticsTracker({ path }) {
  const recordPageView = useMutation(api.analytics.recordPageView)
  useEffect(() => {
    if (!path) return
    const sessionId = getSessionId()
    if (sessionId) recordPageView({ path, sessionId }).catch(() => {})
  }, [path, recordPageView])
  return null
}
