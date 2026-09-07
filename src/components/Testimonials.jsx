export default function Testimonials({ testimonials = [] }) {
  if (!testimonials.length) return null

  return (
    <div className="container section">
      <div className="section-head">
        <h2 className="h2" style={{ fontSize: 26 }}>শিক্ষার্থীরা যা বলছে</h2>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {testimonials.map((t, i) => (
          <div className="card testimonial-card" key={i}>
            <p className="testimonial-quote">"{t.quote}"</p>
            <div>
              <div className="testimonial-name">{t.name}</div>
              {t.role && <div className="testimonial-role">{t.role}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
