import { followLink } from '../utils/navigation'
import { productUrl } from '../utils/productCodes'
import '../styles/SignatureCreations.css'

export default function ProductCard({ product, onNavigate, reveal = false }) {
  const href = productUrl(product)
  return (
    <a
      className={`signature-card${reveal ? ' reveal-on-scroll' : ''}`}
      href={href}
      onClick={onNavigate ? (event) => followLink(event, () => onNavigate(href)) : undefined}
      aria-label={`View details for ${product.name}`}
    >
      <div className="signature-image-box">
        {product.imageUrl && <img src={product.imageUrl} alt={product.name} loading="lazy" />}
      </div>
      <div className="signature-info">
        <span className="signature-metal">{product.metal}</span>
        <h3 className="signature-title">{product.name}</h3>
        <span className="signature-price">LKR {product.price.toLocaleString('en-LK')}</span>
      </div>
    </a>
  )
}
