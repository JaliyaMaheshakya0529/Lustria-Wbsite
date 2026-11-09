import { useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

// Runs only on the admin route, after authorization. Existing products are
// assigned permanent numbers in small transactions. New products are numbered
// directly in their create mutation, including batch uploads.
export default function ProductNumberInitializer() {
  const isAdmin = useQuery(api.products.adminStatus)
  const migrate = useMutation(api.products.assignLegacyNumbers)

  useEffect(() => {
    if (isAdmin !== true) return
    let cancelled = false
    const run = async () => {
      try {
        for (let i = 0; i < 100 && !cancelled; i++) {
          const result = await migrate({})
          if (result.remaining === 0 || result.assigned === 0) break
        }
      } catch (err) {
        console.error('Lustria product code migration failed:', err)
      }
    }
    void run()
    return () => { cancelled = true }
  }, [isAdmin, migrate])
  return null
}
