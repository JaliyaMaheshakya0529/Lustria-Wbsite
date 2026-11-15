import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'

async function loadHandlers(file) {
  const source = await readFile(new URL(`../convex/${file}.ts`, import.meta.url), 'utf8')
  const code = stripTypeScriptTypes(source).replace(/from "([^"]+)"/g, (_, specifier) => {
    const url = specifier.startsWith('.')
      ? new URL(`../convex/${specifier.slice(2)}.js`, import.meta.url).href
      : import.meta.resolve(specifier)
    return `from ${JSON.stringify(url)}`
  })
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}

const products = await loadHandlers('products')
const analytics = await loadHandlers('analytics')

const indexFields = {
  by_productNo: ['productNo'],
  by_available_created: ['createdAt'],
  by_featured_available_created: ['createdAt'],
  by_available_featured_created: ['featured', 'createdAt'],
  by_available_price: ['price'],
  by_timestamp: ['timestamp'],
}

function fixture() {
  const tables = {
    admins: [{ _id: 'admin-row', userId: 'admin' }],
    products: [], productCodeAliases: [], productCounters: [],
    sitePageViews: [], stagedProductImages: [], customOrders: [],
  }
  const files = new Map(['shared', 'replacement', 'abandoned'].map(id => [
    id, { size: 1000, contentType: 'image/jpeg' },
  ]))
  const scheduled = new Map()
  let nextId = 0
  const newId = () => `row-${++nextId}`
  const findRow = id => Object.values(tables).flat().find(row => row._id === id)
  const db = {
    query(table) {
      const filters = []
      let index, direction
      const select = () => {
        const rows = tables[table].filter(row => filters.every(filter => filter(row)))
        if (!direction) return rows
        return rows.sort((a, b) => {
          for (const field of indexFields[index]) {
            const value = (a[field] ?? 0) - (b[field] ?? 0)
            if (value) return direction === 'asc' ? value : -value
          }
          return 0
        })
      }
      const range = {
        eq(field, value) { filters.push(row => row[field] === value); return range },
        gte(field, value) { filters.push(row => row[field] >= value); return range },
        lt(field, value) { filters.push(row => row[field] < value); return range },
      }
      const query = {
        withIndex(name, criteria) { index = name; criteria?.(range); return query },
        order(value) { direction = value; return query },
        filter(criteria) {
          const filter = { field: name => name, eq: (field, value) => row => row[field] === value }
          filters.push(criteria(filter))
          return query
        },
        collect: async () => select(),
        unique: async () => {
          const result = select()
          assert.ok(result.length <= 1)
          return result[0] ?? null
        },
        first: async () => select()[0] ?? null,
        take: async limit => select().slice(0, limit),
        paginate: async ({ cursor, numItems }) => {
          const rows = select()
          const offset = Number(cursor ?? 0)
          const end = offset + numItems
          return { page: rows.slice(offset, end), isDone: end >= rows.length, continueCursor: String(end) }
        },
        async *[Symbol.asyncIterator]() { yield* select() },
      }
      return query
    },
    get: async id => structuredClone(findRow(id) ?? null),
    insert: async (table, document) => {
      const _id = newId()
      tables[table].push({ ...document, _id })
      return _id
    },
    patch: async (id, fields) => Object.assign(findRow(id), fields),
    delete: async id => {
      const table = Object.values(tables).find(rows => rows.some(row => row._id === id))
      table.splice(table.findIndex(row => row._id === id), 1)
    },
    system: { get: async (_table, id) => files.get(id) ?? null },
  }
  const admin = {
    db,
    auth: { getUserIdentity: async () => ({ subject: 'admin|session' }) },
    storage: {
      getUrl: async id => files.has(id) ? `https://example.invalid/${id}` : null,
      delete: async id => files.delete(id),
    },
    scheduler: {
      runAfter: async (delay, _fn, args) => {
        const id = newId()
        scheduled.set(id, { delay, args })
        return id
      },
      cancel: async id => scheduled.delete(id),
    },
  }
  const publicContext = { ...admin, auth: { getUserIdentity: async () => null } }
  return { admin, publicContext, tables, files, scheduled }
}

const ring = {
  name: 'Silver Ring', category: 'Rings', gemstone: 'Sapphire', metal: 'Sterling Silver',
  description: '', price: 6000, imageId: 'shared', available: true, featured: false,
}

test('featured writes preserve product fields, reject stale edits and enforce the cap', async () => {
  const { admin, publicContext, tables } = fixture()
  const id = await products.create._handler(admin, ring)
  await assert.rejects(products.setFeatured._handler(publicContext, { id, featured: true }), /sign in/)
  await products.update._handler(admin, { ...ring, id, expectedRevision: 0, price: 9000 })
  await products.setFeatured._handler(admin, { id, featured: true })
  assert.equal((await admin.db.get(id)).price, 9000)
  await assert.rejects(
    products.update._handler(admin, { ...ring, id, expectedRevision: 1 }),
    error => error.data === 'PRODUCT_CHANGED',
  )
  for (let i = 0; i < 3; i++) await products.create._handler(admin, { ...ring, featured: true })
  await assert.rejects(products.create._handler(admin, { ...ring, featured: true }), /Only four/)
  const nextId = await products.create._handler(admin, ring)
  await assert.rejects(products.setFeatured._handler(admin, { id: nextId, featured: true }), /Only four/)
  assert.equal(tables.products.filter(product => product.featured).length, 4)
})

test('create retries are idempotent and unused staged or replaced images are removed', async () => {
  const { admin, files, scheduled, tables } = fixture()
  assert.equal(await products.stageImage._handler(admin, { imageId: 'shared' }), true)
  assert.equal(await products.stageImage._handler(admin, { imageId: 'shared' }), true)
  assert.equal(scheduled.size, 1)

  const requestId = '3ea038d4-14f3-4a9b-b5c1-de29a22a9f11'
  const id = await products.create._handler(admin, { ...ring, requestId })
  assert.equal(await products.create._handler(admin, { ...ring, requestId }), id)
  assert.equal(tables.products.length, 1)
  assert.equal(scheduled.size, 0)

  const other = await products.create._handler(admin, ring)
  await products.stageImage._handler(admin, { imageId: 'replacement' })
  await products.update._handler(admin, { ...ring, imageId: 'replacement', id, expectedRevision: 0 })
  assert.equal(files.has('shared'), true)
  await products.remove._handler(admin, { id: other })
  assert.equal(files.has('shared'), false)
  await products.update._handler(admin, { ...ring, imageId: 'abandoned', id, expectedRevision: 1 })
  assert.equal(files.has('replacement'), false)
  await products.stageImage._handler(admin, { imageId: 'abandoned' })
  await products.expireStagedImage._handler(admin, { imageId: 'abandoned' })
  assert.equal(files.has('abandoned'), true)
  files.set('unused', { size: 1000, contentType: 'image/jpeg' })
  await products.stageImage._handler(admin, { imageId: 'unused' })
  await products.expireStagedImage._handler(admin, { imageId: 'unused' })
  assert.equal(files.has('unused'), false)
})

test('catalogue filters, sort and pagination keep hidden products out', async () => {
  const { admin, publicContext } = fixture()
  await products.create._handler(admin, ring)
  await products.create._handler(admin, { ...ring, name: 'Low', price: 100 })
  await products.create._handler(admin, { ...ring, available: false, featured: true, price: 10 })
  await products.create._handler(admin, { ...ring, name: 'Pendant', category: 'Necklaces', featured: true })
  const search = { category: 'Rings', gemstone: 'Sapphire', sort: 'price-low' }
  const first = await products.listCollection._handler(publicContext, {
    ...search, paginationOpts: { numItems: 1, cursor: null },
  })
  assert.equal(first.page[0].name, 'Low')
  assert.equal(first.isDone, false)
  const second = await products.listCollection._handler(publicContext, {
    ...search, paginationOpts: { numItems: 1, cursor: first.continueCursor },
  })
  assert.equal(second.page[0].name, ring.name)
  assert.equal(second.isDone, true)
  const featured = await products.listFeatured._handler(publicContext, {})
  assert.deepEqual(featured.map(product => product.name), ['Pendant'])
  assert.equal(featured[0].revision, undefined)
  const facets = await products.collectionFacets._handler(publicContext, {})
  assert.equal(facets.find(item => item.category === 'Rings').count, 2)
})

test('legacy product traffic remains attributed after deletion and old events expire', async () => {
  const { admin, publicContext, tables } = fixture()
  const id = await admin.db.insert('products', { ...ring, productNo: 1, createdAt: 1 })
  const sessionId = 'fixtureSession00001'
  const timestamp = Date.now()
  await admin.db.insert('sitePageViews', { path: '/product/LUS-000001', sessionId, timestamp: timestamp - 3000 })
  await admin.db.insert('sitePageViews', { path: '/', sessionId, timestamp: timestamp - 91 * 86400000 })
  await products.assignLegacyNumbers._handler(admin, {})
  assert.equal((await products.getByNumber._handler(publicContext, { productNo: 1 })).productNo, 50)
  await analytics.recordPageView._handler(publicContext, { path: '/product/LUS-00050', sessionId })
  await analytics.recordPageView._handler(publicContext, { path: '/product/LUS-000001', sessionId })
  await products.remove._handler(admin, { id })
  await analytics.recordPageView._handler(publicContext, { path: '/product/LUS-00050', sessionId: 'fixtureSession00002' })
  const report = await analytics.overview._handler(admin, {})
  assert.equal(report.totalViews, 2)
  assert.equal(report.uniqueSessions, 1)
  const productPage = report.pages.find(page => page.type === 'product')
  assert.equal(productPage.path, '/product/LUS-00050')
  assert.equal(productPage.label, ring.name)
  assert.equal(productPage.available, false)
  assert.equal(productPage.views, 2)
  await analytics.purgeExpired._handler(admin, {})
  assert.equal(tables.sitePageViews.length, 2)
})

test('analytics applies a session limit and a sitewide intake limit', async () => {
  const { admin, publicContext, tables } = fixture()
  const timestamp = Date.now()
  const sessionId = 'fixtureSession00001'
  for (let i = 0; i < 30; i++) {
    await admin.db.insert('sitePageViews', { sessionId, path: '/', timestamp: timestamp - 5000 })
  }
  await analytics.recordPageView._handler(publicContext, { sessionId, path: '/about' })
  assert.equal(tables.sitePageViews.length, 30)
  for (let i = 0; i < 40; i++) {
    await admin.db.insert('sitePageViews', { sessionId: `fixtureTab000${i}`, path: '/', timestamp })
  }
  await analytics.recordPageView._handler(publicContext, { sessionId: 'fixtureNewTab0000', path: '/about' })
  assert.equal(tables.sitePageViews.length, 70)
})
