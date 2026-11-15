import { Component, useMemo, useState } from 'react'
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

function AnalyticsContent() {
  const analytics = useQuery(api.analytics.overview, {})
  const [graphRange, setGraphRange] = useState(30)
  const [period, setPeriod] = useState('views')
  const [kind, setKind] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('most')
  const [activeDay, setActiveDay] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const showTooltip = (event, day) => {
    setActiveDay(day.date)
    const x = event.clientX, y = event.clientY
    setTooltip({ date: day.date, views: day.views,
      x: Math.max(8, Math.min(x + 16, window.innerWidth - 200)),
      y: y + 96 > window.innerHeight ? Math.max(8, y - 88) : y + 16 })
  }
  const [hideZero, setHideZero] = useState(false)
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)
  const resetFilters = () => { setSearch(''); setKind('all'); setPeriod('views'); setSort('most'); setHideZero(false); setPageIndex(0) }


  const days = analytics?.daily?.slice(-graphRange) ?? []
  const maxValue = Math.max(1, ...days.map(d => d.views))
  const graphTotal = days.reduce((sum, day) => sum + day.views, 0)
  const graphAverage = days.length ? (graphTotal / days.length).toFixed(1) : '0'

  const displayed = useMemo(() => {
    const allPages = analytics?.pages ?? []
    const query = search.trim().toLowerCase()
    const filtered = allPages.filter(item =>
      (kind === 'all' || (kind === 'products' ? item.type === 'product' : item.type === 'page')) &&
      (!hideZero || item[period] > 0) &&
      (!query || `${item.label} ${item.path}`.toLowerCase().includes(query))
    )
    return filtered.sort((a, b) => {
      if (sort === 'name') return a.label.localeCompare(b.label)
      if (sort === 'least') return a[period] - b[period] || a.label.localeCompare(b.label)
      return b[period] - a[period] || a.label.localeCompare(b.label)
    })
  }, [analytics?.pages, period, kind, search, sort, hideZero])

  const pageCount = Math.max(1, Math.ceil(displayed.length / pageSize))
  const currentPage = Math.min(pageIndex, pageCount - 1)
  const visiblePages = displayed.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  const selectedDay = days.find(day => day.date === activeDay)
  const peakDay = days.reduce((best, day) => !best || day.views > best.views ? day : best, null)
  const filteredTotal = displayed.reduce((sum, page) => sum + page[period], 0)
  const allCount = analytics?.pages?.length ?? 0
  const productCount = analytics?.pages?.filter(p => p.type === 'product').length ?? 0
  const selectedTotal = analytics?.pages?.reduce((sum, p) => sum + p[period], 0) ?? 0

  return (
    <section className="ladmin-analytics la2" aria-label="Website analytics" data-lenis-prevent onScroll={() => setTooltip(null)}>
      {tooltip && <div className="la2-cursor-tooltip" role="tooltip" style={{ left: tooltip.x, top: tooltip.y }}><span>{tooltip.date}</span><strong>{fmt(tooltip.views)} <small>views</small></strong></div>}
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
                <button type="button" aria-pressed={graphRange === 7} className={graphRange === 7 ? 'selected' : ''} onClick={() => { setGraphRange(7); setActiveDay(null); setTooltip(null) }}>7 days</button>
                <button type="button" aria-pressed={graphRange === 30} className={graphRange === 30 ? 'selected' : ''} onClick={() => { setGraphRange(30); setActiveDay(null); setTooltip(null) }}>30 days</button>
              </div>
            </div>
            <div className="la2-trend-summary">
              <span><strong>{fmt(graphTotal)}</strong> views in this period</span>
              <span><strong>{graphAverage}</strong> average / day</span><span><strong>{peakDay?.views ? peakDay.date : "—"}</strong> busiest day</span>
            </div>
            <div className="la2-chart" aria-label={`Daily page views for the last ${graphRange} days`}>
              {days.map(day => (
                <button type="button" className={`la2-chart-col ${activeDay === day.date ? "is-active" : ""}`} key={day.date} aria-label={`${day.date}: ${fmt(day.views)} views`} aria-pressed={activeDay === day.date} onClick={() => setActiveDay(day.date)} onFocus={() => setActiveDay(day.date)} onPointerEnter={e => { if (e.pointerType !== "touch") showTooltip(e, day) }} onPointerMove={e => { if (e.pointerType !== "touch") showTooltip(e, day) }} onPointerLeave={() => setTooltip(null)} onBlur={() => setTooltip(null)}>
                  <div className="la2-chart-bar" style={{ height: day.views ? `${Math.max(3, day.views / maxValue * 100)}%` : '2px' }} />
                  {graphRange === 7 && <span>{day.date.slice(5)}</span>}
                </button>
              ))}
              {graphTotal === 0 && <div className="la2-chart-empty">No page views recorded for this period.</div>}
            </div>
            <div className="la2-chart-inspector" role="status">{selectedDay ? <><strong>{selectedDay.date}</strong><span>{fmt(selectedDay.views)} page views</span></> : "Hover, focus or tap a bar to inspect a day."}</div>
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
                  <button key={value} type="button" className={kind === value ? 'selected' : ''} aria-pressed={kind === value} onClick={() => { setKind(value); setPageIndex(0) }}>{label}</button>
                ))}
              </div>
              <label className="la2-search">
                <span className="la2-sr-only">Search by page name or product code</span>
                <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
                <input type="search" value={search} onChange={e => { setSearch(e.target.value); setPageIndex(0) }} placeholder="Search pages or product codes" />
              </label>
            </div>
            <div className="la2-table-toolbar">
              <div className="la2-period" role="group" aria-label="Sort and highlight period">
                {[
                  ['today', 'Today'],
                  ['week', '7 days'],
                  ['views', '30 days'],
                ].map(([key, label]) => (
                  <button key={key} type="button" className={period === key ? 'selected' : ''} aria-pressed={period === key} onClick={() => { setPeriod(key); setPageIndex(0) }}>{label}</button>
                ))}
              </div>
              <label className="la2-sort">Sort by
                <select value={sort} onChange={e => { setSort(e.target.value); setPageIndex(0) }}>
                  <option value="most">Most viewed</option>
                  <option value="least">Least viewed</option>
                  <option value="name">Page name</option>
                </select>
              </label>
            </div>
            <div className="la2-results-controls"><span aria-live="polite"><strong>{fmt(filteredTotal)}</strong> views across {displayed.length} matching pages</span><label><input type="checkbox" checked={hideZero} onChange={e => { setHideZero(e.target.checked); setPageIndex(0) }}/> Hide zero-view pages</label><button type="button" onClick={resetFilters}>Reset filters</button></div>
            <div className="la2-table-wrap">
              <table className="la2-table">
                <thead><tr><th>Page</th><th>Today</th><th>7 days</th><th>30 days</th></tr></thead>
                <tbody>
                  {visiblePages.map(page => (
                    <tr key={page.path}>
                      <td>
                        <div className="la2-page-name">
                          <span className="la2-page-type" aria-hidden="true">{page.type === 'product' ? '◇' : '○'}</span>
                          <div>
                            {page.available === false ? <strong>{page.label}</strong>
                              : <a href={page.path} target="_blank" rel="noopener noreferrer">{page.label}</a>}
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
            <div className="la2-pagination"><span aria-live="polite">{displayed.length ? currentPage * pageSize + 1 : 0}–{Math.min((currentPage + 1) * pageSize, displayed.length)} of {displayed.length} pages</span><label>Rows <select aria-label="Pages per table page" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPageIndex(0) }}>{[10,25,50].map(size => <option key={size} value={size}>{size}</option>)}</select></label><div><button type="button" disabled={currentPage === 0} onClick={() => setPageIndex(currentPage - 1)}>Previous</button><span>{currentPage + 1} / {pageCount}</span><button type="button" disabled={currentPage >= pageCount - 1} onClick={() => setPageIndex(currentPage + 1)}>Next</button></div></div>
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

class AnalyticsErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <section className="ladmin-analytics" aria-label="Website analytics">
          <div className="ladmin-analytics-intro">
            <div>
              <h2>Site Analytics</h2>
              <p>First-party page views · Last 30 days · Sri Lanka time</p>
            </div>
          </div>
          <div className="ladmin-analytics-placeholder">
            <strong>Analytics could not load.</strong>
            <p>Try again. If the problem persists, check the Convex deployment and logs. You can still use Products from the sidebar.</p>
            <button
              type="button"
              className="ladmin-primary"
              onClick={() => this.setState({ error: null })}
            >
              Retry Analytics
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}

export default function AdminAnalyticsPanel() {
  return <AnalyticsErrorBoundary><AnalyticsContent /></AnalyticsErrorBoundary>
}
