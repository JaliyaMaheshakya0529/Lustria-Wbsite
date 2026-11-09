import useScrollReveal from '../hooks/useScrollReveal'
import '../styles/OurWork.css' // Reuse the exact .ceperate divider used by Home
import '../styles/About.css'

// Editorial photography only: replace these with your OWN Lustria photography
// in public/about/ whenever it becomes available. See README_SETUP.txt.
const photos = {
  hero: '/about/lustria-story.jpg',
  inspiration: '/about/lustria-inspiration.jpg',
  custom: '/about/lustria-custom.jpg',
  gems: '/about/lustria-gems.jpg',
  design: '/about/lustria-design.jpg',
  crafting: '/about/lustria-crafting.jpg',
  finish: '/about/lustria-finish.jpg'
}

const fallbackImages = {
  hero: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=85',
  inspiration: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=85',
  custom: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200&q=85',
  gems: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
  design: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
  crafting: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80',
  finish: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
}

function StoryImage({ image, alt, className = '' }) {
  return (
    <div className={`about-photo ${className}`}>
      <img
        src={photos[image]}
        alt={alt}
        loading={image === 'hero' ? 'eager' : 'lazy'}
        onError={(event) => {
          const img = event.currentTarget
          if (img.src !== fallbackImages[image]) img.src = fallbackImages[image]
        }}
      />
    </div>
  )
}

function Divider() {
  return (
    <div className="about-divider-wrap reveal-on-scroll" aria-hidden="true">
      <span className="ceperate" />
    </div>
  )
}

const steps = [
  {
    number: '01',
    title: 'Choose the gemstone',
    text: 'We start with the colour, shape and character of a natural Ceylon gemstone, or with the stone you have in mind.',
    image: 'gems'
  },
  {
    number: '02',
    title: 'Shape the idea',
    text: 'We discuss the style, proportions and personal touches, refining the design for the person who will wear it.',
    image: 'design'
  },
  {
    number: '03',
    title: 'Craft the setting',
    text: 'The design takes shape in sterling silver, with the setting made to complement and securely hold the gemstone.',
    image: 'crafting'
  },
  {
    number: '04',
    title: 'Finish with care',
    text: 'The piece is checked and finished before it is ready to become part of someone’s everyday life or special occasion.',
    image: 'finish'
  }
]

export default function About({ onExplore }) {
  useScrollReveal()

  return (
    <div className="about-page">
      <section className="about-hero" aria-labelledby="about-page-heading">
        <div className="about-container about-hero-grid">
          <div className="about-hero-copy reveal-on-scroll">
            <h1 id="about-page-heading">ABOUT LUSTRIA</h1>
            <p className="about-script">Jewellery with a story</p>
            <p className="about-lead">
              We believe the most meaningful jewellery begins with something personal:
              a colour you love, a memory you treasure, or a gemstone that simply feels like you.
            </p>
          </div>
          <div className="reveal-on-scroll">
            <StoryImage image="hero" alt="Elegant gemstone jewellery in a refined arrangement" className="about-hero-image" />
          </div>
        </div>
      </section>

      <Divider />

      <section id="about-story" className="about-section" aria-labelledby="about-story-title">
        <div className="about-container about-story-grid">
          <h2 id="about-story-title" className="about-heading reveal-on-scroll">OUR STORY</h2>
          <div className="about-body reveal-on-scroll">
            <p>
              Lustria grew from a love for the beauty and individuality of Sri Lankan gemstones.
              No two natural stones are exactly alike. We wanted our jewellery to celebrate
              that difference, not hide it.
            </p>
            <p>
              Our approach brings together natural Ceylon gemstones, 925 sterling silver,
              and thoughtful designs that feel elegant without being complicated.
              From a simple everyday pendant to a one-of-a-kind gift, we focus on
              creating pieces with a personal connection.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <section className="about-section" aria-labelledby="about-inspiration-title">
        <div className="about-container about-editorial-grid">
          <div className="reveal-on-scroll">
            <StoryImage image="inspiration" alt="Gemstones and jewellery that inspire Lustria designs" className="about-editorial-image" />
          </div>
          <div className="about-editorial-copy reveal-on-scroll">
            <h2 id="about-inspiration-title" className="about-heading">WHERE OUR INSPIRATION COMES FROM</h2>
            <p>
              Inspiration often begins with the gemstone itself: the depth of a sapphire,
              the softness of a rose-toned stone, or the natural variations that make
              each gem distinctive.
            </p>
            <p>
              We also draw inspiration from the people who wear our pieces — their stories,
              milestones, preferences and ideas. That is why we favour designs that let
              the gem shine while remaining comfortable and timeless.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <section className="about-section" aria-labelledby="about-solutions-title">
        <div className="about-container about-editorial-grid about-editorial-reverse">
          <div className="about-editorial-copy reveal-on-scroll">
            <h2 id="about-solutions-title" className="about-heading">WHAT WE CAN CREATE FOR YOU</h2>
            <p>
              Finding something meaningful should feel exciting, not difficult.
              Whether you have a clear idea or only a gemstone colour in mind,
              we help you turn it into a piece you will enjoy wearing.
            </p>
            <ul className="about-solution-list">
              <li><strong>Personalised jewellery</strong><span>Rings, pendants, earrings and bracelets adapted to your style.</span></li>
              <li><strong>Gemstone choices</strong><span>Explore natural Ceylon stones in colours and shapes that speak to you.</span></li>
              <li><strong>Made for meaningful moments</strong><span>Thoughtful gifts, keepsakes and pieces designed around your own ideas.</span></li>
            </ul>
            <button type="button" className="btn-primary" onClick={onExplore}>Explore Collection</button>
          </div>
          <div className="reveal-on-scroll">
            <StoryImage image="custom" alt="Silver gemstone jewellery with personal design details" className="about-editorial-image" />
          </div>
        </div>
      </section>

      <Divider />

      <section className="about-section about-process" aria-labelledby="about-process-title">
        <div className="about-container">
          <div className="about-process-heading reveal-on-scroll">
            <h2 id="about-process-title" className="about-heading">HOW YOUR JEWELLERY COMES TO LIFE</h2>
            <p>From the first gemstone to the finished piece, every step begins with intention.</p>
          </div>
          <div className="about-process-grid">
            {steps.map((step) => (
              <article className="about-process-card reveal-on-scroll" key={step.number}>
                <StoryImage image={step.image} alt={`${step.title} — illustrative jewellery photography`} className="about-process-photo" />
                <div className="about-process-info">
                  <span className="about-step-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      <section className="about-closing about-section" aria-labelledby="about-closing-title">
        <div className="about-container reveal-on-scroll">
          <h2 id="about-closing-title" className="about-heading">LET'S CREATE SOMETHING PERSONAL</h2>
          <p>Discover a design you love, or begin with your own idea. We would love to help bring it to life.</p>
          <button type="button" className="btn-primary" onClick={onExplore}>Discover the Collection</button>
        </div>
      </section>
    </div>
  )
}
