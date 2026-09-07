import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'

const SUBJECT_ICON = { ICT: '💻', 'পদার্থবিজ্ঞান': '⚛️', 'রসায়ন': '🧪', 'গণিত': '📐', 'ইংরেজি': '📖' }

function discountPct(c) {
  if (!c.oldprice || c.oldprice <= c.price) return 0
  return Math.round((1 - c.price / c.oldprice) * 100)
}

function CourseCard({ course }) {
  const { localized, t } = useLanguage()
  const pct = discountPct(course)
  return (
    <Link to={`/course/${course.id}`} className="card course-card" style={{ display: 'flex' }}>
      <div
        className="thumb"
        style={course.thumb ? { backgroundImage: `url(${course.thumb})` } : {}}
      >
        {!course.thumb && (SUBJECT_ICON[course.subject] || '📚')}
        <div className="thumb-badges">
          <span>{pct > 0 && <span className="pill pill-discount">{pct}% OFF</span>}</span>
          {course.islive ? (
            <span className="pill pill-live">লাইভ</span>
          ) : course.featured ? (
            <span className="pill pill-featured">Featured</span>
          ) : null}
        </div>
      </div>
      <span className="body" style={{ fontSize: 13 }}>{course.subject}</span>
      <h3 className="h3">{localized(course, 'title')}</h3>
      <p className="body" style={{ fontSize: 13 }}>{localized(course, 'desc')}</p>
      <div className="meta-row">
        <span>{course.lessons || 0} {t('lessons')}</span>
        <span>{course.duration}</span>
      </div>
      <div className="price-row">
        {course.oldprice ? <span className="price-old">৳{course.oldprice}</span> : null}
        <span className="price-new">৳{course.price}</span>
      </div>
      <span className="btn btn-primary" style={{ textAlign: 'center' }}>{t('courseDetails')}</span>
    </Link>
  )
}

function CourseCardSkeleton() {
  return <div className="skeleton skeleton-card" aria-hidden="true" />
}

export default function CourseGrid({ courses, filter, loading = false }) {
  if (loading) {
    return (
      <div className="grid">
        {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
      </div>
    )
  }

  const list = filter === 'সব' ? courses : courses.filter(c => c.subject === filter)
  if (list.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">📭</span>
        <p className="empty-state-text">এই বিষয়ে এখনো কোনো কোর্স যোগ করা হয়নি।</p>
      </div>
    )
  }
  return (
    <div className="grid">
      {list.map(c => <CourseCard key={c.id} course={c} />)}
    </div>
  )
}
