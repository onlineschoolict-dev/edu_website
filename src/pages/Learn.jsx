import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useCurriculum } from '../hooks/useCurriculum'
import { useProgress } from '../hooks/useProgress'
import VideoEmbed from '../components/VideoEmbed'
import { extractYouTubeId } from '../utils/youtube'
import { useLanguage } from '../i18n'

export default function Learn({ courses, user, login, myEnrollments, isAdmin }) {
  const { t, localized } = useLanguage()
  const { courseId } = useParams()
  const [params, setParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const course = courses.find(c => c.id === courseId)
  const { modules, totalLessons, flatLessons, loading } = useCurriculum(courseId)
  const { completedLessonIds, setLessonComplete } = useProgress(user, courseId)

  const enrollment = myEnrollments.find(e => e.courseId === courseId)
  const currentLessonId = params.get('lesson') || flatLessons[0]?.id
  const currentIndex = flatLessons.findIndex(l => l.id === currentLessonId)
  const currentLesson = currentIndex >= 0 ? flatLessons[currentIndex] : null

  useEffect(() => {
    if (!params.get('lesson') && flatLessons[0]) {
      setParams({ lesson: flatLessons[0].id }, { replace: true })
    }
  }, [flatLessons]) // eslint-disable-line react-hooks/exhaustive-deps

  const isDemoLesson = currentLesson?.isDemo === true
  const hasAccess = isAdmin || enrollment?.status === 'approved' || isDemoLesson

  const goToLesson = (id) => { setParams({ lesson: id }); setSidebarOpen(false) }

  if (!course) {
    return (
      <div className="container section">
        <div className="note">কোর্সটি পাওয়া যায়নি।</div>
        <Link to="/" className="btn btn-outline" style={{ marginTop: 16 }}>হোমে ফিরে যান</Link>
      </div>
    )
  }

  if (!user && !isDemoLesson) {
    return (
      <div className="container section">
        <div className="note" style={{ marginBottom: 16 }}>{t('loginToWatch')}</div>
        <button className="btn btn-primary" onClick={login}>{t('login')}</button>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="container section">
        <div className="note" style={{ marginBottom: 16 }}>এই কোর্সে আপনার এনরোলমেন্ট এখনো অনুমোদিত হয়নি।</div>
        <Link to={`/course/${courseId}`} className="btn btn-primary">কোর্স ডিটেইলসে ফিরে যান</Link>
      </div>
    )
  }

  // Legacy fallback: course has no modules/lessons yet, just a single video field.
  if (!loading && totalLessons === 0) {
    const legacyVideoType = course.videoType === 'facebook' ? 'facebook' : 'youtube'
    const legacyVideo = legacyVideoType === 'facebook'
      ? { url: course.facebookUrl }
      : { videoId: extractYouTubeId(course.videoid) }
    return (
      <div className="container section" style={{ maxWidth: 900 }}>
        <Link to={`/course/${courseId}`} className="body" style={{ fontSize: 13, display: 'inline-block', marginBottom: 16 }}>← কোর্স ডিটেইলসে ফিরে যান</Link>
        <h1 className="h2" style={{ marginBottom: 16 }}>{course.title}</h1>
        {(legacyVideo.url || legacyVideo.videoId) ? (
          <div className="card">
            {course.islive && <span className="pill pill-live" style={{ marginBottom: 12, display: 'inline-block' }}>সরাসরি লাইভ চলছে</span>}
            <VideoEmbed videoType={legacyVideoType} url={legacyVideo.url} videoId={legacyVideo.videoId} title={course.title} autoplay={course.islive} />
          </div>
        ) : (
          <div className="note">এখনো কোনো ভিডিও/লেসন যোগ করা হয়নি।</div>
        )}
      </div>
    )
  }

  const lessonVideoType = currentLesson?.videoType === 'facebook' ? 'facebook' : 'youtube'
  const lessonVideoUrl = lessonVideoType === 'facebook' ? currentLesson?.facebookUrl : undefined
  const lessonVideoId = lessonVideoType === 'youtube'
    ? extractYouTubeId(currentLesson?.youtubeId || currentLesson?.youtubeUrl)
    : undefined
  const isDone = currentLesson && completedLessonIds.includes(currentLesson.id)
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null

  return (
    <div className="container section">
      <Link to={`/course/${courseId}`} className="body" style={{ fontSize: 13, display: 'inline-block', marginBottom: 16 }}>← কোর্স ডিটেইলসে ফিরে যান</Link>

      <button
        type="button"
        className="btn btn-outline learn-collapsible-toggle"
        aria-expanded={sidebarOpen}
        aria-controls="course-playlist"
        onClick={() => setSidebarOpen(o => !o)}
      >
        কোর্স কনটেন্ট ({pct}% সম্পন্ন) {sidebarOpen ? '▲' : '▼'}
      </button>

      <div className="learn-layout">
        <aside id="course-playlist" className={`learn-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <h3 className="h3" style={{ marginBottom: 8 }}>{course.title}</h3>
          <div className="learn-progress-bar">
            <div className="learn-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="body" style={{ fontSize: 12 }}>{completedLessonIds.length} / {totalLessons} লেসন সম্পন্ন · {pct}%</span>

          <div style={{ marginTop: 16 }}>
            {modules.map((m, mi) => (
              <div key={m.id} style={{ marginBottom: 14 }}>
                <div className="body" style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'hsl(var(--foreground))' }}>
                  মডিউল {mi + 1}: {m.title}
                </div>
                {m.lessons.map((l, li) => {
                  const done = completedLessonIds.includes(l.id)
                  const active = l.id === currentLessonId
                  return (
                    <div
                      key={l.id}
                      className={`learn-lesson-item ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                      onClick={() => goToLesson(l.id)}
                    >
                      <span className="learn-lesson-icon">{done ? '✅' : '▶'}</span>
                      <span>{li + 1}. {l.title}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </aside>

        <div className="learn-main">
          {currentLesson ? (
            <>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                <VideoEmbed videoType={lessonVideoType} url={lessonVideoUrl} videoId={lessonVideoId} title={currentLesson.title} />
              </div>

              <h2 className="h3" style={{ marginBottom: 8 }}>{currentLesson.title}</h2>
              {currentLesson.description && <p className="body" style={{ marginBottom: 16 }}>{currentLesson.description}</p>}

              <button
                className={`btn ${isDone ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => setLessonComplete(currentLesson.id, !isDone)}
              >
                {isDone ? '✓ সম্পন্ন হিসেবে চিহ্নিত' : 'সম্পন্ন হিসেবে চিহ্নিত করুন'}
              </button>

              <div className="learn-nav-buttons">
                <button className="btn btn-outline" disabled={!prevLesson} onClick={() => prevLesson && goToLesson(prevLesson.id)}>
                  ← আগের লেসন
                </button>
                <button className="btn btn-outline" disabled={!nextLesson} onClick={() => nextLesson && goToLesson(nextLesson.id)}>
                  পরের লেসন →
                </button>
              </div>
            </>
          ) : (
            <div className="note">লেসন লোড হচ্ছে...</div>
          )}
        </div>
      </div>
    </div>
  )
}
