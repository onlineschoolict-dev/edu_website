import { useMemo } from 'react'
import { useReviews } from '../hooks/useReviews'

function Stars({ value }) {
  return <span aria-label={`${value} out of 5 stars`} style={{ color: '#f59e0b', letterSpacing: 2 }}>{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
}

export default function StudentReviews({ courseId, compact = false }) {
  const { reviews } = useReviews(courseId)
  const approved = useMemo(() => reviews.filter(review => review.status === 'approved'), [reviews])
  if (!approved.length) return null

  const visible = compact ? approved.sort((a, b) => b.rating - a.rating).slice(0, 4) : approved
  return (
    <section className="container section" aria-label="শিক্ষার্থী রিভিউ">
      {!compact && <div className="section-head"><h2 className="h2" style={{ fontSize: 26 }}>শিক্ষার্থীদের রিভিউ</h2></div>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {visible.map(review => (
          <article className="card testimonial-card" key={review.id}>
            <Stars value={review.rating} />
            <p className="testimonial-quote">“{review.comment}”</p>
            <div className="testimonial-name">{review.userName || 'শিক্ষার্থী'}</div>
          </article>
        ))}
      </div>
    </section>
  )
}

export { Stars }
