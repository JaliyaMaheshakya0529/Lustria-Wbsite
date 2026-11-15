import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import productPage from '../netlify/edge-functions/product-page.js'
import { followLink } from '../src/utils/navigation.js'
import { parseProductCode, productUrl } from '../src/utils/productCodes.js'

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const request = new Request('https://shop.example/product/LUS-000050')
const context = { next: async () => new Response(html, {
  headers: { 'Content-Type': 'text/html', 'ETag': 'asset-etag' },
}) }

test('product routes get metadata, canonical links and real 404 status', async (t) => {
  const originalNetlify = globalThis.Netlify
  globalThis.Netlify = { env: { get: () => 'https://convex.example' } }
  t.after(() => { globalThis.Netlify = originalNetlify })
  const fetch = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.href, 'https://convex.example/api/query')
    assert.deepEqual(JSON.parse(options.body).args, { productNo: 50 })
    return Response.json({
      status: 'success',
      value: { productNo: 50, name: 'Ring <Silver>', description: 'Mixed "stones" & silver' },
    })
  })

  const result = await productPage(request, context)
  assert.equal(result.status, 200)
  assert.equal(result.headers.get('etag'), null)
  assert.equal(result.headers.get('link'), '<https://shop.example/product/LUS-00050>; rel="canonical"')
  const body = await result.text()
  assert.match(body, /<title>Ring &lt;Silver&gt; \| Lustria<\/title>/)
  assert.match(body, /content="Mixed &quot;stones&quot; &amp; silver"/)

  fetch.mock.mockImplementation(async () => Response.json({ status: 'success', value: null }))
  const missing = await productPage(request, context)
  assert.equal(missing.status, 404)
  assert.match(await missing.text(), /name="robots" content="noindex"/)

  fetch.mock.mockImplementation(async () => new Response(null, { status: 503 }))
  const unavailable = await productPage(request, context)
  assert.equal(unavailable.status, 200)
})

test('product codes and native open-in-new-tab behavior are supported', () => {
  assert.equal(productUrl({ productNo: 50 }), '/product/LUS-00050')
  assert.equal(productUrl({ _id: 'legacy-id' }), '/product/legacy-id')
  assert.equal(parseProductCode('LUS-000050'), 50)
  assert.equal(parseProductCode('LUS-000000'), null)

  let prevented = false
  let navigated = false
  const event = { button: 0, preventDefault() { prevented = true } }
  const navigate = () => { navigated = true }
  followLink({ ...event, ctrlKey: true }, navigate)
  assert.equal(prevented, false)
  assert.equal(navigated, false)
  followLink(event, navigate)
  assert.equal(prevented, true)
  assert.equal(navigated, true)
})
