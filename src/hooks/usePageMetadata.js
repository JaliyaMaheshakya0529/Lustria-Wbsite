import { useEffect } from 'react'

export default function usePageMetadata(metadata) {
  const { title, description = '', robots = 'index,follow' } = metadata ?? {}
  useEffect(() => {
    if (!title) return
    document.title = title
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[name="robots"]')?.setAttribute('content', robots)
  }, [title, description, robots])
}
