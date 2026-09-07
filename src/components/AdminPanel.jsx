import { useEffect, useState } from 'react'
import { setEnrollmentStatus } from '../hooks/useEnrollments'
import { uploadImage, isLikelyImageUrl } from '../utils/storage'
import CurriculumManager from './admin/CurriculumManager'
import LiveClassManager from './admin/LiveClassManager'
import TestimonialsEditor from './admin/TestimonialsEditor'
import AdvertisementManager from './admin/AdvertisementManager'
import { useLanguage } from '../i18n'

const EMPTY = {
  title: '', titleBn: '', titleEn: '', subject: 'ICT', thumb: '', poster: '', oldprice: '', price: '',
  lessons: '', duration: '', desc: '', whatYouWillLearn: '',
  descBn: '', descEn: '',
  videoType: 'youtube', videoid: '', facebookUrl: '',
  islive: false, featured: false, featuredOrder: 0, published: true
}

const NAV_ITEMS = [
  { id: 'dashboard', key: 'dashboard', icon: '⌂' },
  { id: 'students', key: 'students', icon: '♙' },
  { id: 'courses', key: 'courses', icon: '▦' },
  { id: 'lessons', key: 'lessons', icon: '≡' },
  { id: 'videos', key: 'videos', icon: '▶' },
  { id: 'advertisements', key: 'advertisements', icon: '▱' },
  { id: 'settings', key: 'settings', icon: '⚙' },
  { id: 'live', key: 'live', icon: '◉' }
]

export default function AdminPanel({
  open, onClose, courses, addCourse, updateCourse, deleteCourse, enrollments,
  settings, updateSettings, uploadHeroImage,
  liveClasses, addLiveClass, updateLiveClass, deleteLiveClass, loading = false
}) {
  const { language, setLanguage, t } = useLanguage()
  const [tab, setTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [managingCurriculumFor, setManagingCurriculumFor] = useState(null)
  const [siteName, setSiteName] = useState(settings?.siteName || '')
  const [overlay, setOverlay] = useState(settings?.heroOverlay ?? 0.55)
  const [uploading, setUploading] = useState(false)
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(!!settings?.onlinePaymentEnabled)
  const [adsEnabled, setAdsEnabled] = useState(settings?.adsEnabled !== false)
  const [heroUrlInput, setHeroUrlInput] = useState('')
  const [toast, setToast] = useState(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [studentFilter, setStudentFilter] = useState('all')

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const notify = (message, type = 'success') => setToast({ message, type })
  const selectTab = (nextTab) => {
    setTab(nextTab)
    setSidebarOpen(false)
  }

  const saveSiteName = async () => {
    await updateSettings({ siteName: siteName.trim() || 'কোচিং সেন্টার' })
    notify('সাইটের নাম আপডেট হয়েছে।')
  }
  const saveOverlay = (v) => { setOverlay(v); updateSettings({ heroOverlay: v }); notify('Overlay আপডেট হয়েছে।') }
  const toggleOnlinePayment = (checked) => {
    setOnlinePaymentEnabled(checked)
    updateSettings({ onlinePaymentEnabled: checked })
    notify(checked ? 'অনলাইন পেমেন্ট চালু হয়েছে।' : 'অনলাইন পেমেন্ট বন্ধ হয়েছে।')
  }
  const toggleAds = (checked) => { setAdsEnabled(checked); updateSettings({ adsEnabled: checked }); notify(checked ? 'বিজ্ঞাপন চালু হয়েছে।' : 'বিজ্ঞাপন বন্ধ হয়েছে।') }

  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadHeroImage(file)
      notify('হিরো ছবি আপলোড হয়েছে।')
    } catch (err) {
      notify('আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', 'error')
    } finally {
      setUploading(false)
      e.target.value = '' // allow re-selecting the same file / retrying after an error
    }
  }

  const saveHeroUrlInput = () => {
    const value = heroUrlInput.trim()
    if (!value) return
    if (!isLikelyImageUrl(value)) { alert('সঠিক একটি ছবির URL দিন (http/https দিয়ে শুরু)।'); return }
    updateSettings({ heroImage: value })
    setHeroUrlInput('')
    notify('হিরো ছবি আপডেট হয়েছে।')
  }

  const removeHeroImage = () => {
    if (confirm('হিরো ছবি সরিয়ে ফেলবেন?')) {
      updateSettings({ heroImage: '' })
      notify('হিরো ছবি সরানো হয়েছে।')
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const edit = (c) => {
    setEditId(c.id)
    setForm({ ...EMPTY, ...c })
    setTab('courses')
  }
  const reset = () => { setEditId(null); setForm(EMPTY) }

  const handleCourseImageUpload = async (field, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage('courses', file)
      set(field, url)
      notify('ছবি আপলোড হয়েছে।')
    } catch (err) {
      notify('আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।', 'error')
    } finally {
      setUploading(false)
      e.target.value = '' // allow re-selecting the same file / retrying after an error
    }
  }

  const save = async () => {
    if (!form.title.trim()) { alert('কোর্সের নাম দিন।'); return }
    const data = {
      ...form,
      oldprice: Number(form.oldprice) || 0,
      price: Number(form.price) || 0,
      lessons: Number(form.lessons) || 0,
      featuredOrder: Number(form.featuredOrder) || 0
    }
    if (editId) {
      await updateCourse(editId, data)
      notify('কোর্স আপডেট হয়েছে।')
    } else {
      await addCourse(data)
      notify('নতুন কোর্স যোগ হয়েছে।')
    }
    reset()
  }

  const pending = enrollments.filter(e => e.status === 'pending')
  const visibleEnrollments = enrollments.filter(item => {
    const query = studentSearch.trim().toLowerCase()
    const matchesSearch = !query || `${item.userEmail || ''} ${item.userId || ''}`.toLowerCase().includes(query)
    const matchesFilter = studentFilter === 'all' || item.status === studentFilter
    return matchesSearch && matchesFilter
  })
  const studentKeys = new Set(enrollments.map(e => e.userId || e.userEmail).filter(Boolean))
  const activeKeys = new Set(enrollments.filter(e => e.status === 'approved').map(e => e.userId || e.userEmail).filter(Boolean))
  const totalLessons = courses.reduce((sum, course) => sum + (Number(course.lessons) || 0), 0)
  const sectionTitle = t(NAV_ITEMS.find(item => item.id === tab)?.key || 'dashboard')

  return (
    <div className={`admin-drawer admin-drawer-wide ${open ? 'open' : ''}`}>
      <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="admin-topbar">
          <button className="admin-menu-toggle" type="button" aria-label="মেনু খুলুন" onClick={() => setSidebarOpen(v => !v)}>☰</button>
          <div>
            <span className="admin-kicker">CONTROL CENTER</span>
            <h2 className="admin-title">অ্যাডমিন প্যানেল</h2>
          </div>
          <div className="language-switcher admin-language-switcher"><button className={language === 'bn' ? 'active' : ''} onClick={() => setLanguage('bn')}>বাংলা</button><span>|</span><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>English</button></div>
          <button className="admin-close" type="button" onClick={onClose} aria-label="প্যানেল বন্ধ করুন">×</button>
        </header>

        <div className="admin-shell-body">
          <nav className="admin-sidebar" aria-label="অ্যাডমিন নেভিগেশন">
            <div className="admin-sidebar-label">MANAGE</div>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                type="button"
                className={`admin-nav-item ${tab === item.id ? 'active' : ''}`}
                onClick={() => selectTab(item.id)}
              >
                <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{t(item.key)}</span>
              </button>
            ))}
            <div className="admin-sidebar-spacer" />
            <button type="button" className="admin-nav-item admin-logout" onClick={onClose}>
              <span className="admin-nav-icon" aria-hidden="true">↪</span><span>লগআউট</span>
            </button>
          </nav>

          <main className="admin-content">
            {loading && <div className="admin-loading-bar" role="status">ডেটা লোড হচ্ছে...</div>}
            <div className="admin-page-heading">
              <div>
                <span className="admin-kicker">{tab === 'dashboard' ? 'OVERVIEW' : 'WORKSPACE'}</span>
                <h1>{sectionTitle}</h1>
              </div>
              {tab === 'courses' && <button type="button" className="btn btn-primary" onClick={() => { reset(); selectTab('courses') }}>+ নতুন কোর্স</button>}
            </div>

      {tab === 'dashboard' && (
        <div className="admin-dashboard">
          <div className="admin-stat-grid">
            <div className="admin-stat-card"><span className="admin-stat-icon blue">♙</span><span className="admin-stat-label">মোট শিক্ষার্থী</span><strong>{studentKeys.size}</strong><small>সব enrollment থেকে</small></div>
            <div className="admin-stat-card"><span className="admin-stat-icon green">▦</span><span className="admin-stat-label">মোট কোর্স</span><strong>{courses.length}</strong><small>{courses.filter(c => c.published !== false).length}টি প্রকাশিত</small></div>
            <div className="admin-stat-card"><span className="admin-stat-icon amber">≡</span><span className="admin-stat-label">মোট লেসন</span><strong>{totalLessons}</strong><small>কোর্সের মোট ক্লাস</small></div>
            <div className="admin-stat-card"><span className="admin-stat-icon rose">◉</span><span className="admin-stat-label">Active users</span><strong>{activeKeys.size}</strong><small>অনুমোদিত enrollment</small></div>
          </div>
          <div className="admin-dashboard-grid">
            <section className="admin-surface">
              <div className="admin-surface-head"><div><span className="admin-kicker">QUICK ACTIONS</span><h2>আজ কী করতে চান?</h2></div></div>
              <div className="admin-quick-actions">
                <button type="button" onClick={() => { reset(); selectTab('courses') }}><span>＋</span> নতুন কোর্স</button>
                <button type="button" onClick={() => selectTab('lessons')}><span>≡</span> লেসন ম্যানেজ করুন</button>
                <button type="button" onClick={() => selectTab('students')}><span>♙</span> পেমেন্ট দেখুন</button>
              </div>
            </section>
            <section className="admin-surface">
              <div className="admin-surface-head"><div><span className="admin-kicker">RECENT ACTIVITY</span><h2>সাম্প্রতিক enrollment</h2></div><button type="button" className="admin-text-button" onClick={() => selectTab('students')}>সব দেখুন →</button></div>
              {enrollments.slice(0, 4).map(item => <div className="admin-activity" key={item.id}><span className="admin-activity-dot" /><div><strong>{item.userEmail || 'নতুন শিক্ষার্থী'}</strong><small>{item.status === 'pending' ? 'অনুমোদনের অপেক্ষায়' : item.status === 'approved' ? 'অনুমোদিত enrollment' : 'রিকোয়েস্ট আপডেট হয়েছে'}</small></div></div>)}
              {enrollments.length === 0 && <div className="admin-empty"><span>◌</span><p>এখনো কোনো activity নেই।</p></div>}
            </section>
          </div>
        </div>
      )}

      {(tab === 'settings') && (
        <div>
          <div className="field">
            <label>সাইটের নাম</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input" value={siteName} onChange={e => setSiteName(e.target.value)} />
              <button className="btn btn-outline" onClick={saveSiteName}>সেভ</button>
            </div>
          </div>

          <div className="field">
            <label>হিরো ব্যাকগ্রাউন্ড ছবি (বড় করে হোমপেজের উপরে সেট হবে)</label>
            {settings?.heroImage && (
              <>
                <div className="hero-preview" style={{ backgroundImage: `url(${settings.heroImage})` }} />
                <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={removeHeroImage}>ছবি সরান</button>
              </>
            )}
            <input type="file" accept="image/*" className="input" onChange={handleHeroUpload} disabled={uploading} style={{ marginTop: 8 }} />
            {uploading && <small style={{ color: 'hsl(var(--muted-foreground))' }}>আপলোড হচ্ছে...</small>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                className="input" placeholder="অথবা সরাসরি ছবির URL পেস্ট করুন"
                value={heroUrlInput} onChange={e => setHeroUrlInput(e.target.value)}
              />
              <button type="button" className="btn btn-outline" onClick={saveHeroUrlInput} disabled={uploading}>সেভ</button>
            </div>
          </div>

          <div className="field">
            <label>ছবির উপর অন্ধকার overlay (লেখা স্পষ্ট দেখাতে): {Math.round(overlay * 100)}%</label>
            <input
              type="range" min="0" max="0.9" step="0.05"
              value={overlay} onChange={e => saveOverlay(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={onlinePaymentEnabled} onChange={e => toggleOnlinePayment(e.target.checked)} />
              অটোমেটিক অনলাইন পেমেন্ট চালু করুন (SSLCommerz — Card/Mobile Banking, তাৎক্ষণিক আনলক)
            </label>
          </div>
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={adsEnabled} onChange={e => toggleAds(e.target.checked)} />
              বিজ্ঞাপন চালু রাখুন
            </label>
          </div>

          <div className="divider" />
          <TestimonialsEditor testimonials={settings?.testimonials || []} updateSettings={updateSettings} />
        </div>
      )}

      {tab === 'advertisements' && <AdvertisementManager advertisements={settings?.advertisements || []} updateSettings={updateSettings} />}

      {(tab === 'students') && (
        <div>
          <div className="admin-toolbar">
            <input className="input" placeholder="নাম, ইমেইল বা User ID দিয়ে খুঁজুন" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
            <select className="input" value={studentFilter} onChange={e => setStudentFilter(e.target.value)}>
              <option value="all">সব status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {visibleEnrollments.length === 0 && <div className="admin-empty"><span>♙</span><p>কোনো শিক্ষার্থী বা enrollment পাওয়া যায়নি।</p></div>}
          {visibleEnrollments.map(e => {
            const course = courses.find(c => c.id === e.courseId)
            return (
              <div className="row admin-student-row" key={e.id}>
                <div>
                  <b style={{ fontSize: 13 }}>{course?.title || e.courseId}</b>
                  <small>{e.userEmail || e.userId} · {e.method || 'Enrollment'} · {e.phone || 'ফোন নেই'}</small>
                </div>
                <div className="row-actions admin-student-actions">
                  <span className={`admin-status ${e.status}`}>{e.status}</span>
                  {e.status === 'pending' && <>
                    <button onClick={async () => { await setEnrollmentStatus(e.id, 'approved'); notify('Enrollment অনুমোদন হয়েছে।') }}>অনুমোদন</button>
                    <button onClick={async () => { await setEnrollmentStatus(e.id, 'rejected'); notify('Enrollment বাতিল হয়েছে।') }}>বাতিল</button>
                  </>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(tab === 'courses' || tab === 'lessons' || tab === 'videos') && (
        <div>
          {courses.length === 0 && <div className="admin-empty"><span>▦</span><p>এখনো কোনো কোর্স নেই। প্রথম কোর্সটি যোগ করুন।</p></div>}
          {courses.map(c => (
            <div key={c.id}>
              <div className="row">
                <div>
                  <b style={{ fontSize: 13 }}>{c.title}</b>
                  <small>
                    {c.subject} · ৳{c.price} {c.islive ? '· লাইভ চলছে' : ''} {c.featured ? '· Featured' : ''} {c.published === false ? '· আনপাবলিশড' : ''}
                  </small>
                </div>
                <div className="row-actions">
                  <button onClick={async () => { await updateCourse(c.id, { published: c.published === false }); notify(c.published === false ? 'কোর্স প্রকাশিত হয়েছে।' : 'কোর্স আনপাবলিশ হয়েছে।') }}>
                    {c.published === false ? 'পাবলিশ' : 'আনপাবলিশ'}
                  </button>
                  <button onClick={() => setManagingCurriculumFor(id => id === c.id ? null : c.id)}>কারিকুলাম</button>
                  <button onClick={() => edit(c)}>এডিট</button>
                  <button onClick={async () => { if (confirm(`“${c.title}” কোর্সটি ডিলিট করবেন? এর course data মুছে যাবে।`)) { await deleteCourse(c.id); notify('কোর্স ডিলিট হয়েছে।') } }}>ডিলিট</button>
                </div>
              </div>
              {managingCurriculumFor === c.id && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <h3 className="h3" style={{ marginBottom: 12 }}>মডিউল ও লেসন — {c.title}</h3>
                  <CurriculumManager courseId={c.id} />
                </div>
              )}
            </div>
          ))}

          <div className="divider" />

          <h3 className="h3">{editId ? 'কোর্স এডিট করুন' : 'নতুন কোর্স যোগ করুন'}</h3>
          <div className="field"><label>কোর্সের নাম</label>
            <input className="input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div className="admin-form-grid"><div className="field"><label>কোর্সের নাম (বাংলা)</label><input className="input" value={form.titleBn} onChange={e => set('titleBn', e.target.value)} /></div><div className="field"><label>Course title (English)</label><input className="input" value={form.titleEn} onChange={e => set('titleEn', e.target.value)} /></div></div>
          <div className="field"><label>বিষয়</label>
            <select className="input" value={form.subject} onChange={e => set('subject', e.target.value)}>
              {['ICT', 'পদার্থবিজ্ঞান', 'রসায়ন', 'গণিত', 'ইংরেজি', 'অন্যান্য'].map(s => <option key={s}>{s}</option>)}
            </select></div>

          <div className="field"><label>থাম্বনেইল ছবি (কোর্স কার্ডে দেখা যাবে)</label>
            {form.thumb && (
              <>
                <div className="hero-preview" style={{ height: 90, backgroundImage: `url(${form.thumb})` }} />
                <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => set('thumb', '')}>ছবি সরান</button>
              </>
            )}
            <input type="file" accept="image/*" className="input" onChange={e => handleCourseImageUpload('thumb', e)} disabled={uploading} style={{ marginTop: 8 }} />
            <input
              className="input" style={{ marginTop: 8 }} placeholder="অথবা সরাসরি ছবির URL পেস্ট করুন"
              value={form.thumb} onChange={e => set('thumb', e.target.value)}
            /></div>

          <div className="field"><label>পোস্টার / ব্যানার ছবি (কোর্স ডিটেইলস পেজ ও ফিচার্ড কার্ডে দেখা যাবে)</label>
            {form.poster && (
              <>
                <div className="hero-preview" style={{ height: 90, backgroundImage: `url(${form.poster})` }} />
                <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={() => set('poster', '')}>ছবি সরান</button>
              </>
            )}
            <input type="file" accept="image/*" className="input" onChange={e => handleCourseImageUpload('poster', e)} disabled={uploading} style={{ marginTop: 8 }} />
            <input
              className="input" style={{ marginTop: 8 }} placeholder="অথবা সরাসরি ছবির URL পেস্ট করুন"
              value={form.poster} onChange={e => set('poster', e.target.value)}
            /></div>

          <div className="field"><label>মূল দাম (৳)</label>
            <input className="input" type="number" value={form.oldprice} onChange={e => set('oldprice', e.target.value)} /></div>
          <div className="field"><label>ডিসকাউন্ট দাম (৳) — ০ দিলে ফ্রি কোর্স</label>
            <input className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)} /></div>
          <div className="field"><label>মোট ক্লাস সংখ্যা (মডিউল/লেসন যোগ না করা পর্যন্ত এটি দেখানো হবে)</label>
            <input className="input" type="number" value={form.lessons} onChange={e => set('lessons', e.target.value)} /></div>
          <div className="field"><label>মেয়াদ</label>
            <input className="input" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="৩ মাস" /></div>
          <div className="field"><label>বর্ণনা</label>
            <input className="input" value={form.desc} onChange={e => set('desc', e.target.value)} /></div>
          <div className="admin-form-grid"><div className="field"><label>বর্ণনা (বাংলা)</label><textarea className="input" value={form.descBn} onChange={e => set('descBn', e.target.value)} /></div><div className="field"><label>Description (English)</label><textarea className="input" value={form.descEn} onChange={e => set('descEn', e.target.value)} /></div></div>
          <div className="field"><label>এই কোর্সে যা শিখবে (প্রতি লাইনে একটি পয়েন্ট)</label>
            <textarea className="input" rows={4} value={form.whatYouWillLearn} onChange={e => set('whatYouWillLearn', e.target.value)} /></div>

          <div className="field"><label>লিগ্যাসি একক ভিডিও — মডিউল/লেসন যোগ না করা পর্যন্ত এটি চলবে</label>
            <select className="input" value={form.videoType} onChange={e => set('videoType', e.target.value)} style={{ marginBottom: 8 }}>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
            </select>
            {form.videoType === 'facebook' ? (
              <input className="input" value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://www.facebook.com/.../videos/..." />
            ) : (
              <input className="input" value={form.videoid} onChange={e => set('videoid', e.target.value)} placeholder="https://youtube.com/watch?v=... বা dQw4w9WgXcQ" />
            )}
          </div>
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.islive} onChange={e => set('islive', e.target.checked)} />
              এখন লাইভ চলছে
            </label>
          </div>
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
              Featured হিসেবে হোমপেজ ক্যারুসেলে দেখান
            </label>
          </div>
          {form.featured && (
            <div className="field"><label>Featured ক্রম (ছোট সংখ্যা আগে দেখাবে)</label>
              <input className="input" type="number" value={form.featuredOrder} onChange={e => set('featuredOrder', e.target.value)} /></div>
          )}
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.published !== false} onChange={e => set('published', e.target.checked)} />
              পাবলিশড (আনচেক করলে স্টুডেন্টরা দেখতে পাবে না)
            </label>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: 12, marginBottom: 8 }} onClick={save} disabled={uploading}>সংরক্ষণ করুন</button>
          {editId && <button className="btn btn-outline" style={{ width: '100%', padding: 10 }} onClick={reset}>বাতিল</button>}
        </div>
      )}

      {tab === 'live' && (
        <LiveClassManager
          liveClasses={liveClasses}
          addLiveClass={addLiveClass}
          updateLiveClass={updateLiveClass}
          deleteLiveClass={deleteLiveClass}
        />
      )}
            {toast && <div className={`admin-toast ${toast.type}`} role="status">{toast.message}</div>}
          </main>
        </div>
      </div>
    </div>
  )
}
