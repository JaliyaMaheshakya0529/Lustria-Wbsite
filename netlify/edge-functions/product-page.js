import { notFoundMetadata, productMetadata, renderMetadata } from '../../src/utils/metadata.js'
import { parseProductCode, productUrl } from '../../src/utils/productCodes.js'

async function findProduct(pathname, deploymentUrl) {
  const match = /^\/product\/([^/]+)$/.exec(pathname.replace(/\/+$/, ''))
  if (!match) return null
  let id
  try {
    id = decodeURIComponent(match[1])
  } catch {
    return null
  }
  if (id.includes('/')) return null
  const productNo = parseProductCode(id)
  const response = await fetch(new URL('/api/query', deploymentUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(2500),
    body: JSON.stringify(productNo === null
      ? { path: 'products:getByLegacyId', args: { legacyId: id }, format: 'json' }
      : { path: 'products:getByNumber', args: { productNo }, format: 'json' }),
  })
  if (!response.ok) throw new Error(`Convex returned HTTP ${response.status}`)
  const result = await response.json()
  if (result.status !== 'success') throw new Error('Convex product lookup failed')
  return result.value
}

export default async function productPage(request, context) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return context.next()
  const deploymentUrl = Netlify.env.get('VITE_CONVEX_URL')
  if (!deploymentUrl) return context.next()

  const url = new URL(request.url)
  let product
  try {
    product = await findProduct(url.pathname, deploymentUrl)
  } catch {
    // Let the storefront handle a temporary backend failure without caching a 404.
    return context.next()
  }

  const response = await context.next()
  const headers = new Headers(response.headers)
  for (const header of ['content-length', 'content-encoding', 'etag']) headers.delete(header)
  headers.set('cache-control', 'no-store')
  if (product?.productNo !== undefined) {
    headers.set('link', `<${new URL(productUrl(product), url)}>; rel="canonical"`)
  }
  const body = request.method === 'HEAD' ? null : renderMetadata(
    await response.text(),
    product ? productMetadata(product) : notFoundMetadata,
  )
  return new Response(body, { status: product ? response.status : 404, headers })
}
