import '../styles/Reviews.css'

const reviewsData = [
  {
    id: 1,
    initials: "AH",
    quote: "The royal blue sapphire ring exceeded every expectation. The silver setting is solid, heavy, and the stone glows with incredible natural fire.",
    author: "Alif Hemeem",
    item: "Custom Blue Sapphire Ring",
    verified: "Verified Collector"
  },
  {
    id: 2,
    initials: "KD",
    quote: "Finding authentic unheated Sri Lankan gems set in genuine 925 silver is rare. The finish and detail on the band are true artisan quality.",
    author: "K. N. Dhananjaya",
    item: "Hand-Forged Solitaire Band",
    verified: "Verified Collector"
  },
  {
    id: 3,
    initials: "SP",
    quote: "Prompt and insured islandwide delivery right to my doorstep. The packaging was immaculate and the piece is stunning in person.",
    author: "Sachini P.",
    item: "Padparadscha Halo Pendant",
    verified: "Verified Collector"
  }
]

export default function Reviews() {
  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-container">
        
        <header className="reviews-header">
          <span className="reviews-tag">Testimonials</span>
          <h2 className="reviews-heading">Client Experiences</h2>
          <p className="reviews-sub">
            Reflections from clients who wear our custom silver and gemstone creations.
          </p>
        </header>

        <div className="reviews-grid">
          {reviewsData.map((review) => (
            <article key={review.id} className="review-card">
              <span className="quote-mark-watermark" aria-hidden="true">“</span>
              
              <div className="review-card-top">
                <div className="review-stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </div>
              </div>

              <blockquote className="review-quote">
                “{review.quote}”
              </blockquote>
              
              <footer className="review-footer">
                <div className="review-avatar">{review.initials}</div>
                <div className="review-meta">
                  <span className="review-author">{review.author}</span>
                  <span className="review-item">{review.item}</span>
                </div>
              </footer>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}