import "../styles/Reviews.css";
// Customer-supplied excerpts. Recommendations are not star ratings.
const reviews = [
  {
    author: "Sandeepa Weerasinghe",
    quote:
      "I had an absolutely marvellous experience with Lustria Gem & jewellery! I ordered a customized silver necklace, ring, and earrings with tourmaline gemstones, and the final products exceeded my expectations!",
  },
  {
    author: "Salinda Wijesinghe",
    quote:
      "Ordered a ring with my own unique design from Lustria, and I received the ring even earlier than I was expected. The design has been so much better than my expectations. Quality and standards are superb.",
  },
  {
    author: "Prabha Sooriyaarachchi",
    quote: "My ring is so stunning and looking is elegant. Thankyou so much ❤️",
  },
];
export default function Reviews() {
  return (
    <section
      className="reviews-section"
      id="reviews"
      aria-labelledby="reviews-title"
    >
      <div className="reviews-container">
        <header className="reviews-heading">
          <div>
            <h2 id="reviews-title">Customer Experiences</h2>
          </div>
          <p>
            A few words from the people who made our creations part of their
            story.
          </p>
        </header>
        <div className="reviews-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.author}>
              <div className="review-card-top">
                <span aria-hidden="true" className="review-quote-mark">
                  “
                </span>
                <span className="review-recommendation">
                  {review.rating ? (
                    <span aria-label="5 out of 5 stars">★★★★★</span>
                  ) : (
                    "★★★★★"
                  )}
                </span>
              </div>
              <blockquote>{review.quote}</blockquote>
              <footer>
                <span className="review-avatar" aria-hidden="true">
                  {review.author
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div>
                  <strong>{review.author}</strong>
                  <span>Customer story</span>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
