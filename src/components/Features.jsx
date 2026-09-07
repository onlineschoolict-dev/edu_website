const FEATURES = [
  { icon: '✦', title: 'Expert Teachers', desc: 'Learn from mentors who make complex ideas clear, practical, and memorable.' },
  { icon: '▣', title: 'Quality Education', desc: 'Structured lessons and carefully selected courses built around real progress.' },
  { icon: '↗', title: 'Flexible Learning', desc: 'Study live, revisit recordings, and keep learning at a pace that works for you.' },
  { icon: '◌', title: '24/7 Support', desc: 'Get the guidance and community support you need beyond the classroom.' }
]

export default function Features() {
  return (
    <div className="container section" id="about">
      <div className="section-head">
        <div><span className="eyebrow">A BETTER WAY TO LEARN</span><h2 className="h2" style={{ fontSize: 26, marginTop: 8 }}>Everything you need to move forward</h2></div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {FEATURES.map(f => (
          <div className="card" key={f.title}>
            <span style={{ fontSize: 26, display: 'inline-block', marginBottom: 12 }} aria-hidden="true">{f.icon}</span>
            <h3 className="h3" style={{ marginBottom: 10 }}>{f.title}</h3>
            <p className="body">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
