import { useState, useEffect, useRef, useCallback } from 'react'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Collection from './pages/Collection'
import ProductDetails from './pages/ProductDetails'
import Footer from './components/Footer'
import Admin from './pages/Admin'
import SiteAnalyticsTracker from './components/SiteAnalyticsTracker'

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [initialCategory, setInitialCategory] = useState(() =>
    new URLSearchParams(window.location.search).get('category') || 'All'
  )
  const lenisRef = useRef(null)

  const resetScroll = useCallback(() => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useEffect(() => {
    // Preserve browser navigation, but start each page at its top.
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

    // Keep Lenis off the admin route so its independent scrolling works.
    if (window.location.pathname.startsWith('/admin')) return undefined

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
    const raf = (time) => { lenis.raf(time); frame = requestAnimationFrame(raf) }
    frame = requestAnimationFrame(raf)

    const onPopState = () => {
      setCurrentPath(window.location.pathname)
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
      ? `${path}?category=${encodeURIComponent(category)}` : path
    if (`${window.location.pathname}${window.location.search}` !== url) {
      window.history.pushState({}, '', url)
    }
    setCurrentPath(path)
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

  const openProduct = (id) => navigateTo(`/product/${encodeURIComponent(id)}`)
  const isCollectionPage = currentPath.startsWith('/collection')
  const isProductPage = currentPath.startsWith('/product/')
  const productId = isProductPage ? decodeURIComponent(currentPath.slice('/product/'.length)) : null
  if (currentPath.startsWith('/admin')) return <Admin />

  return (
    <>
      {/* Only track the routes supported by the existing analytics backend. */}
      {!isProductPage && <SiteAnalyticsTracker path={isCollectionPage ? '/collection' : '/'} />}
      <Navbar onNavigate={navigateTo} />
      <main>
        {isProductPage ? (
          <ProductDetails productId={productId} onNavigate={navigateTo} />
        ) : isCollectionPage ? (
          <Collection
            initialCategory={initialCategory}
            onProductSelect={openProduct}
            onFilterChange={(cat) => {
              const url = cat === 'All' ? '/collection' : `/collection?category=${encodeURIComponent(cat)}`
              window.history.replaceState({}, '', url)
            }}
          />
        ) : (
          <Home
            onExplore={() => navigateTo('/collection', 'All')}
            onProductSelect={openProduct}
          />
        )}
      </main>
      <Footer onNavigate={navigateTo} />
    </>
  )
}
