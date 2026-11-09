import { useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import '../styles/AdminAnalytics.css'

const fmt = (number) => Number(number || 0).toLocaleString('en-LK')
const CSV_ESCAPE = (value) => {
  const text = String(value ?? '')
  // Prevent CSV formula execution in spreadsheet applications.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}

function downloadCSV(rows) {
  const header = ['Page', 'Path', 'Type', 'Today', '7 days', '30 days']
  const csv = [header, ...rows.map(p => [p.label, p.path, p.type, p.today, p.week, p.views])]
    .map(row => row.map(CSV_ESCAPE).join(',')).join('\r\n')
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `lustria-page-views-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function AdminAnalyticsPanel() {
  const analytics = useQuery(api.analytics.overview, {})
  const [graphRange, setGraphRange] = useState(30)
  const [period, setPeriod] = useState('views')
  const [kind, setKind] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('most')

  const days = analytics?.daily?.slice(-graphRange) ?? []
  const maxValue = Math.max(1, ...days.map(d => d.views))
  const graphTotal = days.reduce((sum, day) => sum + day.views, 0)
  const graphAverage = days.length ? (graphTotal / days.length).toFixed(1) : '0'

  const displayed = useMemo(() => {
    const allPages = analytics?.pages ?? []
    const query = search.trim().toLowerCase()
    const filtered = allPages.filter(item =>
      (kind === 'all' || (kind === 'products' ? item.type === 'product' : item.type === 'page')) &&
      (!query || `${item.label} ${item.path}`.toLowerCase().includes(query))
    )
    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.label.localeCompare(b.label)
      if (sort === 'least') return a[period] - b[period] || a.label.localeCompare(b.label)
      return b[period] - a[period] || a.label.localeCompare(b.label)
    })
  }, [analytics?.pages, period, kind, search, sort])

  const allCount = analytics?.pages?.length ?? 0
  const productCount = analytics?.pages?.filter(p => p.type === 'product').length ?? 0
  const selectedTotal = analytics?.pages?.reduce((sum, p) => sum + p[period], 0) ?? 0

  return (
    <section className="ladmin-analytics la2" aria-label="Website analytics" data-lenis-prevent>
      <div className="la2-topline">
        <div>
          <h2>Site Analytics</h2>
          <p>Individual page performance, tracked in Sri Lanka time.</p>
        </div>
        <span className="la2-live"><span className="la2-live-dot" /> Live from Convex</span>
      </div>

      {analytics === undefined ? (
        <div className="la2-panel la2-loading" role="status">Loading your website analytics…</div>
      ) : (
        <>
          <div className="la2-stats" aria-label="Analytics summary">
            {[
              ['Today', analytics.todayViews, 'Views since midnight'],
              ['Last 7 days', analytics.weekViews, 'Total page views'],
              ['Last 30 days', analytics.totalViews, 'Total page views'],
              ['Sessions', analytics.uniqueSessions, 'Approx. unique browser tabs'],
            ].map(([title, number, subtitle]) => (
              <div className="la2-stat" key={title}>
                <div className="la2-stat-label">{title}</div>
                <strong>{fmt(number)}</strong>
                <small>{subtitle}</small>
              </div>
            ))}
          </div>

          <div className="la2-panel la2-trend">
            <div className="la2-panel-head">
              <div>
                <h3>Traffic overview</h3>
                <p>Page views by day</p>
              </div>
              <div className="la2-toggle" role="group" aria-label="Traffic chart range">
                <button type="button" aria-pressed={graphRange === 7} className={graphRange === 7 ? 'selected' : ''} onClick={() => setGraphRange(7)}>7 days</button>
                <button type="button" aria-pressed={graphRange === 30} className={graphRange === 30 ? 'selected' : ''} onClick={() => setGraphRange(30)}>30 days</button>
              </div>
            </div>
            <div className="la2-trend-summary">
              <span><strong>{fmt(graphTotal)}</strong> views in this period</span>
              <span><strong>{graphAverage}</strong> average / day</span>
            </div>
            <div className="la2-chart" aria-label={`Daily page views for the last ${graphRange} days`}>
              {days.map(day => (
                <div className="la2-chart-col" key={day.date} title={`${day.date}: ${fmt(day.views)} views`}>
                  <div className="la2-chart-bar" style={{ height: day.views ? `${Math.max(3, day.views / maxValue * 100)}%` : '2px' }} />
                  {graphRange === 7 && <span>{day.date.slice(5)}</span>}
                </div>
              ))}
              {graphTotal === 0 && <div className="la2-chart-empty">No page views recorded for this period.</div>}
            </div>
            {graphRange === 30 && <div className="la2-axis"><span>{days[0]?.date}</span><span>{days[days.length - 1]?.date}</span></div>}
          </div>

          <div className="la2-panel la2-pages">
            <div className="la2-panel-head la2-pages-heading">
              <div>
                <h3>Views by page</h3>
                <p>Every page and product has its own view count.</p>
              </div>
              <button type="button" className="la2-export" onClick={() => downloadCSV(displayed)} disabled={!displayed.length}>
                Export CSV
              </button>
            </div>
            <div className="la2-controls">
              <div className="la2-tabs" role="group" aria-label="Page type">
                {[
                  ['all', `All (${allCount})`],
                  ['website', 'Website pages'],
                  ['products', `Products (${productCount})`],
                ].map(([value, label]) => (
                  <button key={value} type="button" className={kind === value ? 'selected' : ''} aria-pressed={kind === value} onClick={() => setKind(value)}>{label}</button>
                ))}
              </div>
              <label className="la2-search">
                <span className="la2-sr-only">Search by page name or product code</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
                <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages or product codes" />
              </label>
            </div>
            <div className="la2-table-toolbar">
              <div className="la2-period" role="group" aria-label="Sort and highlight period">
                {[
                  ['today', 'Today'],
                  ['week', '7 days'],
                  ['views', '30 days'],
                ].map(([key, label]) => (
                  <button key={key} type="button" className={period === key ? 'selected' : ''} aria-pressed={period === key} onClick={() => setPeriod(key)}>{label}</button>
                ))}
              </div>
              <label className="la2-sort">Sort by
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="most">Most viewed</option>
                  <option value="least">Least viewed</option>
                  <option value="name">Page name</option>
                </select>
              </label>
            </div>
            <div className="la2-table-wrap">
              <table className="la2-table">
                <thead><tr><th>Page</th><th>Today</th><th>7 days</th><th>30 days</th></tr></thead>
                <tbody>
                  {displayed.map(page => (
                    <tr key={page.path}>
                      <td>
                        <div className="la2-page-name">
                          <span className="la2-page-type" aria-hidden="true">{page.type === 'product' ? '◇' : '○'}</span>
                          <div>
                            <a href={page.path} target="_blank" rel="noopener noreferrer">{page.label}</a>
                            <small>{page.path}</small>
                            <div className="la2-share" aria-hidden="true"><span style={{ width: `${selectedTotal ? (page[period] / selectedTotal) * 100 : 0}%` }} /></div>
                          </div>
                        </div>
                      </td>
                      <td className={period === 'today' ? 'is-selected' : ''}>{fmt(page.today)}</td>
                      <td className={period === 'week' ? 'is-selected' : ''}>{fmt(page.week)}</td>
                      <td className={period === 'views' ? 'is-selected' : ''}>{fmt(page.views)}</td>
                    </tr>
                  ))}
                  {!displayed.length && <tr><td className="la2-empty" colSpan={4}>No pages match your search or filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="la2-table-footer">Showing {displayed.length} of {allCount} pages · 404 and admin routes excluded.</div>
          </div>
          <p className="la2-note">
            Visits recorded before analytics was enabled cannot be recovered. Sessions are approximate browser-tab sessions, not individual visitors.
            {analytics.truncated ? ' More than 10,000 events were found in the reporting window; counts may be incomplete.' : ''}
          </p>
        </>
      )}
    </section>
  )
}
