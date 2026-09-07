import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const SUBJECT_ICON = { ICT: '💻', 'পদার্থবিজ্ঞান': '⚛️', 'রসায়ন': '🧪', 'গণিত': '📐', 'ইংরেজি': '📖' }

function CarouselCard({ course, role }) {
  // role: 'active' | 'side' (prev/next preview)
  return (
    <Link
      to={`/course/${course.id}`}
      className={`fc-card fc-card-${role}`}
      style={course.poster || course.thumb ? { backgroundImage: `url(${course.poster || course.thumb})` } : {}}
    >
      {!course.poster && !course.thumb && <span className="fc-icon">{SUBJECT_ICON[course.subject] || '📚'}</span>}
      <div className="fc-card-overlay">
        <span className="fc-card-subject">{course.subject}</span>
        <h3 className="fc-card-title">{course.title}</h3>
        {role === 'active' && (
          <span className="btn btn-primary fc-cta">এখনই দেখুন / Enroll Now</span>
        )}
      </div>
    </Link>
  )
}

export default function FeaturedCarousel({ courses }) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef(null)

  const count = courses.length

  useEffect(() => { if (index >= count) setIndex(0) }, [count, index])

  useEffect(() => {
    if (count < 2) return
    const t = setInterval(() => setIndex(i => (i + 1) % count), 6000)
    return () => clearInterval(t)
  }, [count])

  if (count === 0) return null

  const go = (delta) => setIndex(i => (i + delta + count) % count)

  const prev = courses[(index - 1 + count) % count]
  const active = courses[index]
  const next = courses[(index + 1) % count]

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta > 40) go(-1)
    else if (delta < -40) go(1)
    touchStartX.current = null
  }

  return (
    <div className="container section featured-section">
      <div className="section-head">
        <h2 className="h2" style={{ fontSize: 26 }}>ফিচার্ড কোর্স</h2>
      </div>

      <div className="fc-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {count > 1 && (
          <button className="fc-nav fc-nav-prev" aria-label="আগের কোর্স" onClick={() => go(-1)}>‹</button>
        )}

        <div className="fc-track">
          {count > 1 && <CarouselCard course={prev} role="side" />}
          <CarouselCard course={active} role="active" />
          {count > 1 && <CarouselCard course={next} role="side" />}
        </div>

        {count > 1 && (
          <button className="fc-nav fc-nav-next" aria-label="পরের কোর্স" onClick={() => go(1)}>›</button>
        )}
      </div>

      {count > 1 && (
        <div className="fc-dots">
          {courses.map((c, i) => (
            <button
              key={c.id}
              className={`fc-dot ${i === index ? 'active' : ''}`}
              aria-label={`কোর্স ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
