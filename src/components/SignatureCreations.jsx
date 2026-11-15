import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import ProductCard from './ProductCard'
import { followLink } from '../utils/navigation'

export default function SignatureCreations({ onExplore, onNavigate }) {
  const products = useQuery(api.products.listFeatured)

  return (
    <section className="signatures-section" id="collection">
      <div className="signatures-container">
        <div className="signatures-header">
          <h2 className="signatures-heading">SIGNATURE CREATIONS</h2>
          <p className="signatures-sub">
            Handcrafted Ceylon gems and bespoke sterling silver settings.
          </p>
        </div>

        <div className="signatures-grid">
          {products?.map((product) => (
            <ProductCard key={product._id} product={product} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="signatures-action">
          <a href="/collection" className="btn-signatures-view" onClick={(event) => followLink(event, onExplore)}>
            View All Pieces
          </a>
        </div>
      </div>
    </section>
  )
}
