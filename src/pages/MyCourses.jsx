import { Link } from 'react-router-dom'
import { useCurriculum } from '../hooks/useCurriculum'
import { useProgress } from '../hooks/useProgress'

function MyCourseCard({ course, user }) {
  const { totalLessons } = useCurriculum(course.id)
  const { completedLessonIds } = useProgress(user, course.id)
  const pct = totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0

  return (
    <Link to={`/learn/${course.id}`} className="card course-card" style={{ display: 'flex' }}>
      <div className="thumb" style={course.thumb ? { backgroundImage: `url(${course.thumb})` } : {}}>
        {!course.thumb && '📚'}
      </div>
      <span className="body" style={{ fontSize: 13 }}>{course.subject}</span>
      <h3 className="h3">{course.title}</h3>
      {totalLessons > 0 ? (
        <>
          <div className="learn-progress-bar">
            <div className="learn-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="body" style={{ fontSize: 13 }}>
            {completedLessonIds.length} / {totalLessons} লেসন সম্পন্ন · {pct}%
          </span>
        </>
      ) : (
        <span className="body" style={{ fontSize: 13 }}>এখনো লেসন যোগ করা হয়নি</span>
      )}
      <span className="btn btn-primary" style={{ textAlign: 'center', marginTop: 'auto' }}>শেখা শুরু করুন</span>
    </Link>
  )
}

export default function MyCourses({ courses, user, myEnrollments, login }) {
  if (!user) {
    return (
      <div className="container section">
        <div className="note" style={{ marginBottom: 16 }}>আপনার কোর্স দেখতে প্রথমে লগইন করুন।</div>
        <button className="btn btn-primary" onClick={login}>Google দিয়ে লগইন</button>
      </div>
    )
  }

  const approved = myEnrollments.filter(e => e.status === 'approved')
  const myCourses = approved
    .map(e => courses.find(c => c.id === e.courseId))
    .filter(Boolean)

  return (
    <div className="container section">
      <div className="section-head">
        <h2 className="h2" style={{ fontSize: 26 }}>আমার কোর্স</h2>
      </div>
      {myEnrollments.loading ? (
        <div className="grid">
          {Array.from({ length: 3 }).map((_, i) => <div className="skeleton skeleton-card" key={i} aria-hidden="true" />)}
        </div>
      ) : myCourses.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🎓</span>
          <p className="empty-state-text">আপনি এখনো কোনো কোর্সে ভর্তি হননি। <Link to="/">কোর্স ব্রাউজ করুন</Link></p>
        </div>
      ) : (
        <div className="grid">
          {myCourses.map(c => <MyCourseCard key={c.id} course={c} user={user} />)}
        </div>
      )}
    </div>
  )
}
