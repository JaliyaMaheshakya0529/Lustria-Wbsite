import { useEffect } from 'react'

export default function useScrollReveal(dependency) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    )

    const targets = document.querySelectorAll('.reveal-on-scroll:not(.is-visible)')
    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [dependency])
}