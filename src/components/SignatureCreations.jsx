import '../styles/SignatureCreations.css'

import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export default function SignatureCreations({ onExplore }) {
  const products = useQuery(api.products.list)
  const signaturePieces = (products || [])
    .filter((product) => product.featured)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4)
    .map((product) => ({
      id: product._id,
      title: product.name,
      metal: product.metal,
      price: `LKR ${product.price.toLocaleString('en-LK')}`,
      image: product.imageUrl
    }))

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
          {signaturePieces.map((piece) => (
            <article key={piece.id} className="signature-card">
              <div className="signature-image-box">
                <img src={piece.image} alt={piece.title} loading="lazy" />
              </div>

              <div className="signature-info">
                <span className="signature-metal">{piece.metal}</span>
                <h3 className="signature-title">{piece.title}</h3>
                <span className="signature-price">{piece.price}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="signatures-action">
          <a href="/collection" className="btn-signatures-view" onClick={(event) => { event.preventDefault(); onExplore?.() }}>
            View All Pieces
          </a>
        </div>
      </div>
    </section>
  )
}