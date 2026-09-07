import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import AdminPanel from './components/AdminPanel'
import Home from './pages/Home'
import CourseDetail from './pages/CourseDetail'
import MyCourses from './pages/MyCourses'
import Learn from './pages/Learn'
import { useAuth } from './hooks/useAuth'
import { useCourses } from './hooks/useCourses'
import { useMyEnrollments, useAllEnrollments } from './hooks/useEnrollments'
import { useSiteSettings } from './hooks/useSiteSettings'
import { useTheme } from './hooks/useTheme'
import { useLiveClasses } from './hooks/useLiveClasses'
import AdBanner from './components/AdBanner'
import { useLanguage } from './i18n'

export default function App() {
  const { t } = useLanguage()
  const { user, login, logout, isAdmin, authError, loading: authLoading } = useAuth()
  const { courses, loading: coursesLoading, addCourse, updateCourse, deleteCourse } = useCourses()
  const myEnrollments = useMyEnrollments(user)
  const allEnrollments = useAllEnrollments(isAdmin)
  const { settings, updateSettings, uploadHeroImage } = useSiteSettings()
  const { theme, toggleTheme } = useTheme()
  const { liveClasses, addLiveClass, updateLiveClass, deleteLiveClass } = useLiveClasses()

  const [adminOpen, setAdminOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('payment')
    if (status) {
      setPaymentStatus(status)
      params.delete('payment')
      params.delete('tran_id')
      const rest = params.toString()
      window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''))
    }
  }, [])

  return (
    <>
      {paymentStatus && (
        <div className={`payment-banner payment-${paymentStatus}`}>
          {paymentStatus === 'success' && '✅ পেমেন্ট সফল হয়েছে! কয়েক সেকেন্ডের মধ্যে কোর্স আনলক হয়ে যাবে।'}
          {paymentStatus === 'fail' && '❌ পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন বা ম্যানুয়াল bKash/Nagad ব্যবহার করুন।'}
          {paymentStatus === 'cancel' && 'পেমেন্ট বাতিল করা হয়েছে।'}
          <button className="payment-banner-close" onClick={() => setPaymentStatus(null)}>×</button>
        </div>
      )}
      <Navbar
        user={user}
        isAdmin={isAdmin}
        login={login}
        authError={authError}
        logout={logout}
        onOpenAdmin={() => setAdminOpen(true)}
        siteName={settings.siteName}
        theme={theme}
        toggleTheme={toggleTheme}
        courses={courses}
      />

      <main>
        <AdBanner ads={settings.advertisements} adsEnabled={settings.adsEnabled !== false} position="homepage" />
        <Routes>
          <Route path="/" element={<Home courses={courses} coursesLoading={coursesLoading} settings={settings} liveClasses={liveClasses} />} />
          <Route
            path="/course/:id"
            element={
              <CourseDetail
                courses={courses}
                user={user}
                login={login}
                myEnrollments={myEnrollments}
                onlinePaymentEnabled={settings.onlinePaymentEnabled}
                advertisements={settings.advertisements}
                adsEnabled={settings.adsEnabled !== false}
              />
            }
          />
          <Route path="/my-courses" element={<MyCourses courses={courses} user={user} myEnrollments={myEnrollments} login={login} advertisements={settings.advertisements} adsEnabled={settings.adsEnabled !== false} />} />
          <Route
            path="/learn/:courseId"
            element={<Learn courses={courses} user={user} login={login} myEnrollments={myEnrollments} isAdmin={isAdmin} />}
          />
          <Route
            path="/admin"
            element={
              <AdminRoute loading={authLoading} user={user} isAdmin={isAdmin} login={login} authError={authError}>
                <AdminPanel
                  open
                  onClose={() => window.history.back()}
                  courses={courses}
                  addCourse={addCourse}
                  updateCourse={updateCourse}
                  deleteCourse={deleteCourse}
                  enrollments={allEnrollments}
                  settings={settings}
                  updateSettings={updateSettings}
                  uploadHeroImage={uploadHeroImage}
                  liveClasses={liveClasses}
                  addLiveClass={addLiveClass}
                  updateLiveClass={updateLiveClass}
                  deleteLiveClass={deleteLiveClass}
                  loading={coursesLoading}
                />
              </AdminRoute>
            }
          />
        </Routes>
      </main>

      <footer>
        <div className="container footer-inner">
          <span>© {settings.siteName}</span>
          {isAdmin && <button className="link-btn" onClick={() => setAdminOpen(true)}>{t('admin')}</button>}
        </div>
      </footer>

      {isAdmin && (
        <AdminPanel
          open={adminOpen}
          onClose={() => setAdminOpen(false)}
          courses={courses}
          addCourse={addCourse}
          updateCourse={updateCourse}
          deleteCourse={deleteCourse}
          enrollments={allEnrollments}
          settings={settings}
          updateSettings={updateSettings}
          uploadHeroImage={uploadHeroImage}
          liveClasses={liveClasses}
          addLiveClass={addLiveClass}
          updateLiveClass={updateLiveClass}
          deleteLiveClass={deleteLiveClass}
        />
      )}
    </>
  )
}

    function AdminRoute({ loading, user, isAdmin, login, authError, children }) {
      const navigate = useNavigate()

      useEffect(() => {
        if (!loading && user && !isAdmin) navigate('/', { replace: true })
      }, [loading, user, isAdmin, navigate])

      if (loading) return <div className="admin-auth-loading" role="status">অ্যাডমিন অ্যাক্সেস যাচাই হচ্ছে...</div>

      if (!user) {
        return (
          <div className="container section" style={{ maxWidth: 420, textAlign: 'center' }}>
            <div className="note" style={{ marginBottom: 16 }}>অ্যাডমিন প্যানেলে যেতে Google দিয়ে লগইন করুন।</div>
            {authError && <div className="note" style={{ marginBottom: 16 }}>Google login সম্পন্ন হয়নি। Firebase domain/provider settings চেক করুন।</div>}
            <button className="btn btn-primary" onClick={login}>Google দিয়ে লগইন</button>
          </div>
        )
      }

      if (!isAdmin) {
        return null
      }

      return children
    }
