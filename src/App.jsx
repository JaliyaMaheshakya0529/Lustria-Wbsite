import { useState, useEffect } from 'react'
import Lenis from 'lenis'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Collection from './pages/Collection'
import Footer from './components/Footer'

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)
  const [initialCategory, setInitialCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('category') || 'All'
  })

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2
    })

    let animationFrameId
    function raf(time) {
      lenis.raf(time)
      animationFrameId = requestAnimationFrame(raf)
    }
    animationFrameId = requestAnimationFrame(raf)

    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
      const params = new URLSearchParams(window.location.search)
      setInitialCategory(params.get('category') || 'All')
    }

    const handleScrollLock = (event) => {
      if (event.detail?.locked) lenis.stop()
      else lenis.start()
    }
    window.addEventListener('popstate', handlePopState)
    window.addEventListener('lustria:scroll-lock', handleScrollLock)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('lustria:scroll-lock', handleScrollLock)
      lenis.destroy()
    }
  }, [])

  const navigateTo = (path, category = null, section = null) => {
    const url = category && category !== 'All'
      ? `${path}?category=${encodeURIComponent(category)}`
      : path

    window.history.pushState({}, '', url)
    setCurrentPath(path)
    setInitialCategory(category || 'All')

    if (section) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
        })
      })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }

  const isCollectionPage = currentPath.startsWith('/collection')

  return (
    <>
      <Navbar onNavigate={navigateTo} />
      <main>
        {isCollectionPage ? (
          <Collection
            initialCategory={initialCategory}
            onFilterChange={(cat) => {
              const url = cat === 'All' ? '/collection' : `/collection?category=${encodeURIComponent(cat)}`
              window.history.replaceState({}, '', url)
            }}
          />
        ) : (
          <Home onExplore={() => navigateTo('/collection', 'All')} />
        )}
      </main>
      <Footer onNavigate={navigateTo} />
    </>
  )
}