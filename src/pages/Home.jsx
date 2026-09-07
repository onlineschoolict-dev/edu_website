import { useMemo, useState } from 'react'
import Hero from '../components/Hero'
import Features from '../components/Features'
import GrowthStats from '../components/GrowthStats'
import CourseGrid from '../components/CourseGrid'
import FeaturedCarousel from '../components/FeaturedCarousel'
import LiveBanner from '../components/LiveBanner'
import Testimonials from '../components/Testimonials'

// A course with no `published` field yet (older documents) is treated as published,
// so nothing that's already live disappears after this update.
const isPublished = (c) => c.published !== false

export default function Home({ courses, coursesLoading = false, settings, liveClasses = [] }) {
  const [filter, setFilter] = useState('সব')

  const publishedCourses = useMemo(() => courses.filter(isPublished), [courses])

  const featuredCourses = useMemo(() => {
    const featured = publishedCourses
      .filter(c => c.featured)
      .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))
    // Fallback: if the admin hasn't marked anything as featured yet, show the
    // most recent published courses so the carousel is never empty.
    return featured.length > 0 ? featured : publishedCourses.slice(0, 6)
  }, [publishedCourses])

  const subjects = useMemo(() => ['সব', ...new Set(publishedCourses.map(c => c.subject))], [publishedCourses])

  return (
    <>
      <Hero image={settings?.heroImage} overlay={settings?.heroOverlay} />
      <LiveBanner liveClasses={liveClasses} />
      <FeaturedCarousel courses={featuredCourses} />
      <Features />
      <GrowthStats />
      <div className="container section" id="courses">
        <div className="section-head">
          <h2 className="h2" style={{ fontSize: 26 }}>সব কোর্স</h2>
        </div>
        <div className="filters">
          {subjects.map(s => (
            <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
        <CourseGrid courses={publishedCourses} filter={filter} loading={coursesLoading} />
      </div>
      <Testimonials testimonials={settings?.testimonials || []} />
    </>
  )
}
