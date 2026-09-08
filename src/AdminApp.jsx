// Mounted instead of the student <App/> when VITE_APP_MODE=admin (see main.jsx).
// Deploy this same repo as a second Vercel project (e.g. admin.yourdomain.com)
// with VITE_APP_MODE=admin set in its environment variables, and it becomes a
// standalone admin site that never renders any student-facing route.
import AdminPanel from './components/AdminPanel'
import { useAuth } from './hooks/useAuth'
import { useCourses } from './hooks/useCourses'
import { useAllEnrollments } from './hooks/useEnrollments'
import { useSiteSettings } from './hooks/useSiteSettings'
import { useLiveClasses } from './hooks/useLiveClasses'
import { useReviews } from './hooks/useReviews'

export default function AdminApp() {
  const { user, login, logout, isAdmin, loading, authError } = useAuth()
  const { courses, addCourse, updateCourse, deleteCourse, loading: coursesLoading } = useCourses()
  const allEnrollments = useAllEnrollments(isAdmin)
  const { settings, updateSettings, uploadHeroImage } = useSiteSettings()
  const { liveClasses, addLiveClass, updateLiveClass, deleteLiveClass } = useLiveClasses()
  const { reviews } = useReviews()

  if (loading) {
    return <div className="admin-auth-loading" role="status">অ্যাডমিন প্যানেল লোড হচ্ছে...</div>
  }

  if (!user) {
    return (
      <div className="container section" style={{ maxWidth: 420, textAlign: 'center' }}>
        <h1 className="h2" style={{ marginBottom: 20 }}>Admin Login</h1>
        {authError && <div className="note" style={{ marginBottom: 16 }}>লগইন করা যায়নি। Google login, authorized domain এবং popup settings চেক করুন।</div>}
        <button className="btn btn-primary" style={{ width: '100%', padding: 12 }} onClick={login}>
          Google দিয়ে লগইন
        </button>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container section" style={{ maxWidth: 420, textAlign: 'center' }}>
        <div className="note" style={{ marginBottom: 16 }}>
          এই অ্যাকাউন্টের ({user.email}) অ্যাডমিন অ্যাক্সেস নেই।
        </div>
        <button className="btn btn-outline" onClick={logout}>লগআউট করে অন্য অ্যাকাউন্ট দিয়ে চেষ্টা করুন</button>
      </div>
    )
  }

  return (
    <div className="admin-standalone">
      <AdminPanel
        open
        onClose={logout}
        courses={courses}
        addCourse={addCourse}
        updateCourse={updateCourse}
        deleteCourse={deleteCourse}
        enrollments={allEnrollments}
        reviews={reviews}
        settings={settings}
        updateSettings={updateSettings}
        uploadHeroImage={uploadHeroImage}
        liveClasses={liveClasses}
        addLiveClass={addLiveClass}
        updateLiveClass={updateLiveClass}
        deleteLiveClass={deleteLiveClass}
        loading={coursesLoading}
      />
    </div>
  )
}
