import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { requestEnrollment } from '../hooks/useEnrollments'
import { useCurriculum } from '../hooks/useCurriculum'
import CourseCurriculumPreview from '../components/CourseCurriculumPreview'

export default function CourseDetail({ courses, user, login, myEnrollments, onlinePaymentEnabled }) {
  const { id } = useParams()
  const course = courses.find(c => c.id === id)
  const { modules, totalLessons } = useCurriculum(id)

  const [method, setMethod] = useState('bkash')
  const [phone, setPhone] = useState('')
  const [txnId, setTxnId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [payingOnline, setPayingOnline] = useState(false)

  const payOnline = async () => {
    setPayingOnline(true)
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          courseTitle: course.title,
          amount: course.price,
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          phone
        })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('পেমেন্ট শুরু করা যায়নি। আবার চেষ্টা করুন।')
      }
    } catch {
      alert('পেমেন্ট শুরু করা যায়নি। আবার চেষ্টা করুন।')
    } finally {
      setPayingOnline(false)
    }
  }

  if (!course) {
    return (
      <div className="container section">
        <div className="note">কোর্সটি পাওয়া যায়নি।</div>
        <Link to="/" className="btn btn-outline" style={{ marginTop: 16 }}>হোমে ফিরে যান</Link>
      </div>
    )
  }

  const enrollment = myEnrollments.find(e => e.courseId === course.id)

  const submit = async () => {
    if (!user) { login(); return }
    if (phone.length < 11 || txnId.trim().length < 4) {
      alert('সঠিক মোবাইল নম্বর এবং Transaction ID দিন।')
      return
    }
    setSubmitting(true)
    try {
      await requestEnrollment({ user, courseId: course.id, method, phone, txnId })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <Link to="/" className="body" style={{ fontSize: 13, display: 'inline-block', marginBottom: 20 }}>← সব কোর্সে ফিরে যান</Link>

      {course.poster && (
        <div className="thumb" style={{ height: 220, marginBottom: 20, backgroundImage: `url(${course.poster})` }} />
      )}

      <span className="body" style={{ fontSize: 13 }}>{course.subject}</span>
      <h1 className="h2" style={{ margin: '8px 0 12px' }}>{course.title}</h1>
      <p className="body" style={{ marginBottom: 20 }}>{course.desc}</p>
      <div className="meta-row" style={{ marginBottom: 24, flexWrap: 'wrap' }}>
        <span>{modules.length > 0 ? `${modules.length} মডিউল` : `${course.lessons || 0} ক্লাস`}</span>
        {modules.length > 0 && <span>{totalLessons} লেসন</span>}
        <span>{course.duration}</span>
        {typeof course.enrolledCount === 'number' && <span>{course.enrolledCount} জন শিক্ষার্থী</span>}
        <span>{course.price ? 'পেইড' : 'ফ্রি'}</span>
      </div>

      {course.whatYouWillLearn && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="h3" style={{ marginBottom: 12 }}>এই কোর্সে যা শিখবেন</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {course.whatYouWillLearn.split('\n').filter(Boolean).map((line, i) => (
              <li key={i} className="body" style={{ marginBottom: 6 }}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {modules.length > 0 && (
        <>
          <h3 className="h3" style={{ marginBottom: 12 }}>কারিকুলাম</h3>
          <CourseCurriculumPreview modules={modules} unlocked={enrollment?.status === 'approved'} />
        </>
      )}

      {enrollment?.status === 'approved' ? (
        <div className="card" style={{ marginBottom: 20 }}>
          {course.islive && <span className="pill pill-live" style={{ marginBottom: 12, display: 'inline-block' }}>সরাসরি লাইভ চলছে</span>}
          <p className="body" style={{ marginBottom: 16 }}>আপনি এই কোর্সে ভর্তি আছেন — লেসন দেখা শুরু করুন।</p>
          <Link to={`/learn/${course.id}`} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
            শেখা শুরু করুন / Start Learning
          </Link>
        </div>
      ) : enrollment?.status === 'pending' ? (
        <div className="note" style={{ marginBottom: 20 }}>আপনার পেমেন্ট যাচাই চলছে। অ্যাডমিন অনুমোদন করলেই কোর্সটি আনলক হয়ে যাবে।</div>
      ) : enrollment?.status === 'rejected' ? (
        <div className="note" style={{ marginBottom: 20 }}>আপনার আগের পেমেন্ট রিকোয়েস্টটি গ্রহণ করা হয়নি। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।</div>
      ) : null}

      {(!enrollment || enrollment.status === 'rejected') && (
        <div className="card">
          <div className="price-row" style={{ marginBottom: 20 }}>
            {course.oldprice ? <span className="price-old">৳{course.oldprice}</span> : null}
            <span className="price-new" style={{ fontSize: 28 }}>৳{course.price}</span>
          </div>

          {!user ? (
            <button className="btn btn-primary" style={{ width: '100%', padding: 12 }} onClick={login}>
              কিনতে হলে প্রথমে লগইন করুন
            </button>
          ) : (
            <>
              {onlinePaymentEnabled && (
                <>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: 12, marginBottom: 12 }}
                    disabled={payingOnline}
                    onClick={payOnline}
                  >
                    {payingOnline ? 'যাচাই করা হচ্ছে...' : '⚡ এখনই পে করুন (Card/Mobile Banking) — তাৎক্ষণিক আনলক'}
                  </button>
                  <div className="section-head" style={{ margin: '4px 0 16px' }}>
                    <span className="body" style={{ fontSize: 12 }}>অথবা ম্যানুয়ালি bKash/Nagad Send Money করুন</span>
                  </div>
                </>
              )}
              <div className="pay-options">
                <div className={`pay-opt ${method === 'bkash' ? 'selected' : ''}`} onClick={() => setMethod('bkash')}>bKash</div>
                <div className={`pay-opt ${method === 'nagad' ? 'selected' : ''}`} onClick={() => setMethod('nagad')}>Nagad</div>
              </div>
              <div className="note" style={{ marginBottom: 16 }}>
                উপরের নাম্বারে <b>৳{course.price}</b> Send Money করুন, তারপর নিচে আপনার নাম্বার ও Transaction ID দিন। অ্যাডমিন যাচাই করে অনুমোদন দিলে কোর্সটি আনলক হবে।
              </div>
              <div className="field">
                <label>আপনার মোবাইল নম্বর</label>
                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
              </div>
              <div className="field">
                <label>Transaction ID</label>
                <input className="input" value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="যেমনঃ 8N7A2K9XYZ" />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: 12 }} disabled={submitting} onClick={submit}>
                {submitting ? 'পাঠানো হচ্ছে...' : 'পেমেন্ট তথ্য জমা দিন'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
