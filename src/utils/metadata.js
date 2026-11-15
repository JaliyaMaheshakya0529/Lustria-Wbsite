export const pageMetadata = {
  '/': {
    title: 'Lustria Gem & Jewellery',
    description: 'Discover handcrafted sterling silver jewellery set with natural Ceylon gemstones.',
  },
  '/collection': {
    title: 'Jewellery Collection | Lustria',
    description: 'Explore Lustria rings, earrings, necklaces and natural Ceylon gemstones. Filter by jewellery type or gemstone.',
  },
  '/about': {
    title: 'About Lustria | Ceylon Gem & Jewellery',
    description: 'Meet Lustria and discover how natural Sri Lankan gemstones become handcrafted sterling silver jewellery.',
  },
  '/admin': { title: 'Lustria Admin', robots: 'noindex' },
}

export const notFoundMetadata = { title: 'Page Not Found | Lustria', robots: 'noindex' }

export function productMetadata(product) {
  const description = product.description?.trim().replace(/\s+/g, ' ')
    || `Explore ${product.name}, handcrafted jewellery from Lustria.`
  return { title: `${product.name} | Lustria`, description: description.slice(0, 160) }
}

const escapeHtml = (value) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])

export function renderMetadata(html, { title, description = '', robots = 'index,follow' }) {
  return html
    .replace(/<title>.*?<\/title>/s, () => `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, (_, prefix, suffix) => prefix + escapeHtml(description) + suffix)
    .replace(/(<meta name="robots" content=")[^"]*(")/, (_, prefix, suffix) => prefix + escapeHtml(robots) + suffix)
}
