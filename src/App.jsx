import { useState, useEffect, useRef, useCallback } from 'react'
import Lenis from 'lenis'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import ProductDetails from './pages/ProductDetails'
import NotFound from './pages/NotFound'
import Footer from './components/Footer'
import Admin from './pages/Admin'
import SiteAnalyticsTracker from './components/SiteAnalyticsTracker'
import './styles/NotFound.css'
import { productUrl } from './utils/productCodes'

// Match only routes this app actually supports.
const normalizePath = (path) => path.replace(/\/+$/, '') || '/'
const safeDecode = (value) => {
  try { return decodeURIComponent(value) } catch { return null }
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname))
  const [initialCategory, setInitialCategory] = useState(() =>
    new URLSearchParams(window.location.search).get('category') || 'All'
  )
  const lenisRef = useRef(null)

  // Browser-tab title is always the brand, never a product name.
  useEffect(() => { document.title = 'Lustria' }, [currentPath])

  const resetScroll = useCallback(() => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    if (normalizePath(window.location.pathname).startsWith('/admin')) return undefined

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2
    })
    lenisRef.current = lenis
    let frame
    const raf = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname))
      setInitialCategory(new URLSearchParams(window.location.search).get('category') || 'All')
      resetScroll()
      requestAnimationFrame(resetScroll)
    }
    const onScrollLock = (event) => {
      if (event.detail?.locked) lenis.stop()
      else lenis.start()
    }
    window.addEventListener('popstate', onPopState)
    window.addEventListener('lustria:scroll-lock', onScrollLock)
    resetScroll()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('popstate', onPopState)
      window.removeEventListener('lustria:scroll-lock', onScrollLock)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [resetScroll])

  const navigateTo = (path, category = null, section = null) => {
    const url = category && category !== 'All'
      ? `${path}?category=${encodeURIComponent(category)}`
      : path
    if (`${window.location.pathname}${window.location.search}` !== url) {
      window.history.pushState({}, '', url)
    }
    setCurrentPath(normalizePath(path))
    setInitialCategory(category || 'All')

    if (section) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const target = document.getElementById(section)
        if (target) {
          if (lenisRef.current) lenisRef.current.scrollTo(target, { duration: 1.2, force: true })
          else target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else resetScroll()
      }))
    } else {
      resetScroll()
      requestAnimationFrame(resetScroll)
    }
  }

  const openProduct = (product) => {
    if (!product) return
    if (typeof product === 'string') {
      // Legacy callbacks that only provide an internal Convex ID.
      navigateTo(`/product/${encodeURIComponent(product)}`)
      return
    }
    navigateTo(productUrl(product))
  }

  const isHome = currentPath === '/'
  const isCollection = currentPath === '/collection'
  const isAbout = currentPath === '/about'
  const isProduct = currentPath.startsWith('/product/') && currentPath.length > '/product/'.length && !currentPath.slice('/product/'.length).includes('/')
  const isAdmin = currentPath === '/admin' || currentPath.startsWith('/admin/')
  const productId = isProduct ? safeDecode(currentPath.slice('/product/'.length)) : null

  if (isAdmin) return <Admin />

  const trackingPath = isHome ? '/' : isCollection ? '/collection' : isAbout ? '/about' : null

  return (
    <>
      {trackingPath && <SiteAnalyticsTracker path={trackingPath} />}
      <Navbar onNavigate={navigateTo} />
      <main>
        {isHome ? (
          <Home
            onExplore={() => navigateTo('/collection', 'All')}
            onNavigate={navigateTo}
            onProductSelect={openProduct}
            onProductClick={openProduct}
          />
        ) : isCollection ? (
          <Collection
            initialCategory={initialCategory}
            onProductSelect={openProduct}
            onProductClick={openProduct}
            onFilterChange={(cat) => {
              const url = cat === 'All' ? '/collection' : `/collection?category=${encodeURIComponent(cat)}`
              window.history.replaceState({}, '', url)
            }}
          />
        ) : isAbout ? (
          <About onExplore={() => navigateTo('/collection', 'All')} />
        ) : isProduct && productId ? (
          <ProductDetails
            key={productId}
            productId={productId}
            onNavigate={navigateTo}
            onBack={() => navigateTo('/collection', 'All')}
          />
        ) : (
          <NotFound onNavigate={navigateTo} />
        )}
      </main>
      <Footer onNavigate={navigateTo} />
    </>
  )
}
