import { useState } from 'react'
import { setEnrollmentStatus } from '../hooks/useEnrollments'
import { uploadImage, isLikelyImageUrl } from '../utils/storage'
import CurriculumManager from './admin/CurriculumManager'
import LiveClassManager from './admin/LiveClassManager'
import TestimonialsEditor from './admin/TestimonialsEditor'

const EMPTY = {
  title: '', subject: 'ICT', thumb: '', poster: '', oldprice: '', price: '',
  lessons: '', duration: '', desc: '', whatYouWillLearn: '',
  videoType: 'youtube', videoid: '', facebookUrl: '',
  islive: false, featured: false, featuredOrder: 0, published: true
}

const TABS = [
  { id: 'settings', label: 'সাইট সেটিংস' },
  { id: 'enrollments', label: 'পেমেন্ট অনুমোদন' },
  { id: 'courses', label: 'কোর্স' },
  { id: 'live', label: 'YouTube Live' }
]

export default function AdminPanel({
  open, onClose, courses, addCourse, updateCourse, deleteCourse, enrollments,
  settings, updateSettings, uploadHeroImage,
  liveClasses, addLiveClass, updateLiveClass, deleteLiveClass
}) {
  const [tab, setTab] = useState('settings')
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [managingCurriculumFor, setManagingCurriculumFor] = useState(null)
  const [siteName, setSiteName] = useState(settings?.siteName || '')
  const [overlay, setOverlay] = useState(settings?.heroOverlay ?? 0.55)
  const [uploading, setUploading] = useState(false)
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(!!settings?.onlinePaymentEnabled)
  const [heroUrlInput, setHeroUrlInput] = useState('')

  const saveSiteName = () => updateSettings({ siteName: siteName.trim() || 'কোচিং সেন্টার' })
  const saveOverlay = (v) => { setOverlay(v); updateSettings({ heroOverlay: v }) }
  const toggleOnlinePayment = (checked) => { setOnlinePaymentEnabled(checked); updateSettings({ onlinePaymentEnabled: checked }) }

  const handleHeroUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadHeroImage(file)
    } catch (err) {
      alert('আপলোড ব্যর্থ হয়েছে: ' + err.message)
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
  }

  const removeHeroImage = () => {
    if (confirm('হিরো ছবি সরিয়ে ফেলবেন?')) updateSettings({ heroImage: '' })
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
    } catch (err) {
      alert('আপলোড ব্যর্থ হয়েছে: ' + err.message)
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
    if (editId) await updateCourse(editId, data)
    else await addCourse(data)
    reset()
  }

  const pending = enrollments.filter(e => e.status === 'pending')

  return (
    <div className={`admin-drawer admin-drawer-wide ${open ? 'open' : ''}`}>
      <button className="modal-close" style={{ position: 'static', float: 'right' }} onClick={onClose}>×</button>
      <h2 className="h3" style={{ marginBottom: 16 }}>অ্যাডমিন প্যানেল</h2>

      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'settings' && (
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

          <div className="divider" />
          <TestimonialsEditor testimonials={settings?.testimonials || []} updateSettings={updateSettings} />
        </div>
      )}

      {tab === 'enrollments' && (
        <div>
          <h2 className="h3">পেন্ডিং পেমেন্ট অনুমোদন</h2>
          {pending.length === 0 && <p className="body" style={{ fontSize: 13 }}>কোনো পেন্ডিং রিকোয়েস্ট নেই।</p>}
          {pending.map(e => {
            const course = courses.find(c => c.id === e.courseId)
            return (
              <div className="row" key={e.id}>
                <div>
                  <b style={{ fontSize: 13 }}>{course?.title || e.courseId}</b>
                  <small>{e.userEmail} · {e.method} · {e.phone} · TxnID: {e.txnId}</small>
                </div>
                <div className="row-actions">
                  <button onClick={() => setEnrollmentStatus(e.id, 'approved')}>অনুমোদন</button>
                  <button onClick={() => setEnrollmentStatus(e.id, 'rejected')}>বাতিল</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'courses' && (
        <div>
          <h2 className="h3">কোর্স ম্যানেজ করুন</h2>
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
                  <button onClick={() => updateCourse(c.id, { published: c.published === false })}>
                    {c.published === false ? 'পাবলিশ' : 'আনপাবলিশ'}
                  </button>
                  <button onClick={() => setManagingCurriculumFor(id => id === c.id ? null : c.id)}>কারিকুলাম</button>
                  <button onClick={() => edit(c)}>এডিট</button>
                  <button onClick={() => { if (confirm('ডিলিট করবেন?')) deleteCourse(c.id) }}>ডিলিট</button>
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
    </div>
  )
}
