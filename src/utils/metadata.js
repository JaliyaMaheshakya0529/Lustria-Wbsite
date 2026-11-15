export const pageMetadata = {
  '/': {
    title: 'Lustria Gem & Jewellery',
    description: 'Discover handcrafted sterling silver jewellery set with natural Ceylon gemstones.',
  },
  '/collection': {
    title: 'Lustria Gem & Jewellery | Collection',
    description: 'Explore Lustria rings, earrings, necklaces and natural Ceylon gemstones. Filter by jewellery type or gemstone.',
  },
  '/about': {
    title: 'Lustria Gem & Jewellery | About',
    description: 'Meet Lustria and discover how natural Sri Lankan gemstones become handcrafted sterling silver jewellery.',
  },
  '/custom-order': { title: 'Design Your Ring | Lustria', description: 'Share your idea for a handcrafted custom ring.' },
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
