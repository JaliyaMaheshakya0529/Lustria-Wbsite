import { useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import SiteAnalyticsTracker from '../components/SiteAnalyticsTracker'
import NotFound from './NotFound'
import { productCode, parseProductCode } from '../utils/productCodes'
import '../styles/ProductDetails.css'
import '../styles/ProductCode.css'

const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '')

export default function ProductDetails({ productId, onNavigate }) {
  const numericCode = parseProductCode(productId)
  const byCode = useQuery(
    api.products.getByNumber,
    numericCode !== null ? { productNo: numericCode } : 'skip'
  )
  const byLegacyId = useQuery(
    api.products.getByLegacyId,
    numericCode === null && typeof productId === 'string'
      ? { legacyId: productId }
      : 'skip'
  )
  const product = numericCode !== null ? byCode : byLegacyId
  const isLoading = product === undefined
  const code = productCode(product?.productNo)

  useEffect(() => {
    if (!product) return
    document.title = 'Lustria'
    if (code && productId !== code) {
      // Keep previously shared internal-ID links working, then switch to the permanent URL.
      window.history.replaceState({}, '', `/product/${code}`)
    }
    return () => { document.title = 'Lustria' }
  }, [product, code, productId])

  const goBack = () => onNavigate('/collection')

  if (isLoading) {
    return <section className="lpd-page"><div className="lpd-state" role="status">Loading jewellery details…</div></section>
  }
  if (!product) {
    // Invalid and deleted product URLs use the SAME site's 404 design,
    // and never mount a page-view tracker.
    return <NotFound onNavigate={onNavigate} />
  }

  const price = `LKR ${Number(product.price).toLocaleString('en-LK', { maximumFractionDigits: 2 })}`
  const canonicalPath = code ? `/product/${code}` : null
  const productLink = canonicalPath ? `${window.location.origin}${canonicalPath}` : window.location.href
  const inquiry = [
    'Hello Lustria, I would like to inquire about this jewellery piece:',
    `Product: ${product.name}`,
    ...(code ? [`Product ID: ${code}`] : []),
    `Price: ${price}`,
    `Link: ${productLink}`,
    'Could you please share more details?'
  ].join('\n')
  const whatsappHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(inquiry)}`
    : null

  return (
    <section className="lpd-page">
      {/* Only valid product pages are tracked. Invalid product URLs are excluded. */}
      {canonicalPath && <SiteAnalyticsTracker path={canonicalPath} />}
      <div className="lpd-container">
        <nav className="lpd-breadcrumb" aria-label="Breadcrumb">
          <button type="button" onClick={() => onNavigate('/')}>Home</button>
          <span>/</span>
          <button type="button" onClick={goBack}>Collection</button>
          <span>/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="lpd-layout">
          <div className="lpd-image-wrap">
            {product.imageUrl ? (
              <img className="lpd-image" src={product.imageUrl} alt={product.name} />
            ) : <div className="lpd-no-image">Image unavailable</div>}
          </div>
          <div className="lpd-content">
            <span className="lpd-eyebrow">LUSTRIA · {product.category}</span>
            <h1>{product.name}</h1>
            {code && <p className="lpd-product-code">Product ID: {code}</p>}
            <p className="lpd-price">{price}</p>
            <span className="lpd-availability">{product.available ? 'Available' : 'Unavailable'}</span>
            {product.description && <p className="lpd-description">{product.description}</p>}
            <div className="lpd-specs">
              <h2>Product Details</h2>
              <dl>
                {code && <div><dt>Product ID</dt><dd>{code}</dd></div>}
                <div><dt>Category</dt><dd>{product.category}</dd></div>
                {product.gemstone && <div><dt>Gemstone</dt><dd>{product.gemstone}</dd></div>}
                {product.metal && <div><dt>Metal</dt><dd>{product.metal}</dd></div>}
              </dl>
            </div>
            {whatsappHref ? (
              <a className="lpd-whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.4 11.6a8.4 8.4 0 0 1-12.3 7.5L3.5 20.5l1.5-4.4A8.4 8.4 0 1 1 20.4 11.6Z"/><path d="M9 8.3c-.3-.6-.7-.5-1-.5-.3 0-.7.2-.9.6-.2.4-.5 1.2.1 2.4.6 1.3 2.2 3.2 4.4 4.2 1.7.8 2.4.4.4-.3.8-1.1.7-1.4"/></svg>
                Inquire via WhatsApp
              </a>
            ) : (
              <p className="lpd-setup-note">Set VITE_WHATSAPP_NUMBER in the environment variables to enable WhatsApp inquiries.</p>
            )}
            <p className="lpd-help">Ask us about availability, sizing and customisation.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
