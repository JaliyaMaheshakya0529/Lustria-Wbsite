import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Footer from './components/Footer'
import SiteAnalyticsTracker from './components/SiteAnalyticsTracker'
import usePageMetadata from './hooks/usePageMetadata'
import { pageMetadata } from './utils/metadata'

const Collection = lazy(() => import('./pages/Collection'))
const About = lazy(() => import('./pages/About'))
const ProductDetails = lazy(() => import('./pages/ProductDetails'))
const Admin = lazy(() => import('./pages/Admin'))

function readLocation() {
  return {
    path: window.location.pathname.replace(/\/+$/, '') || '/',
    category: new URLSearchParams(window.location.search).get('category') || 'All',
  }
}

function readProductId(path) {
  const match = /^\/product\/([^/]+)$/.exec(path)
  if (!match) return null
  try { return decodeURIComponent(match[1]) } catch { return null }
}

function LoadingPage() {
  return <p className="page-loading" role="status">Loading…</p>
}

export default function App() {
  const [{ path, category }, setLocation] = useState(readLocation)
  const lenisRef = useRef(null)
  const isAdmin = path === '/admin' || path.startsWith('/admin/')
  const productId = readProductId(path)
  const staticPage = path === '/' || path === '/collection' || path === '/about'
  usePageMetadata(isAdmin ? pageMetadata['/admin'] : staticPage ? pageMetadata[path] : null)

  const restoreScroll = useCallback(() => {
    const hash = window.location.hash.slice(1)
    const target = hash && document.getElementById(hash)
    if (target) {
      target.scrollIntoView()
      return
    }
    lenisRef.current?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    const onPopState = () => {
      setLocation(readLocation())
      requestAnimationFrame(restoreScroll)
    }
    window.addEventListener('popstate', onPopState)
    if (window.location.hash) requestAnimationFrame(restoreScroll)
    return () => {
      window.history.scrollRestoration = previousRestoration
      window.removeEventListener('popstate', onPopState)
    }
  }, [restoreScroll])

  useEffect(() => {
    if (isAdmin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      autoRaf: true,
    })
    lenisRef.current = lenis
    const onScrollLock = (event) => {
      if (event.detail?.locked) lenis.stop()
      else lenis.start()
    }
    window.addEventListener('lustria:scroll-lock', onScrollLock)
    return () => {
      window.removeEventListener('lustria:scroll-lock', onScrollLock)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [isAdmin])

  const navigateTo = (nextPath, nextCategory = null) => {
    const url = nextCategory && nextCategory !== 'All'
      ? `${nextPath}?category=${encodeURIComponent(nextCategory)}`
      : nextPath
    if (window.location.pathname + window.location.search + window.location.hash !== url) {
      window.history.pushState({}, '', url)
    }
    setLocation(readLocation())
    restoreScroll()
    requestAnimationFrame(restoreScroll)
  }

  const selectCategory = (nextCategory) => {
    const url = nextCategory === 'All' ? '/collection' : `/collection?category=${encodeURIComponent(nextCategory)}`
    window.history.replaceState({}, '', url)
    setLocation(readLocation())
  }

  const explore = () => navigateTo('/collection')

  if (isAdmin) return <Suspense fallback={<LoadingPage />}><Admin /></Suspense>

  return (
    <>
      {staticPage && <SiteAnalyticsTracker path={path} />}
      <Navbar onNavigate={navigateTo} />
      <main>
        <Suspense fallback={<LoadingPage />}>
          {path === '/' ? (
            <Home onExplore={explore} onNavigate={navigateTo} />
          ) : path === '/collection' ? (
            <Collection selectedCategory={category} onFilterChange={selectCategory} onNavigate={navigateTo} />
          ) : path === '/about' ? (
            <About onExplore={explore} />
          ) : productId ? (
            <ProductDetails key={productId} productId={productId} onNavigate={navigateTo} />
          ) : (
            <NotFound onNavigate={navigateTo} />
          )}
        </Suspense>
      </main>
      <Footer onNavigate={navigateTo} />
    </>
  )
}
