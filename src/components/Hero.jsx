import { useEffect, useState } from 'react'
import ClassroomCarousel from './ClassroomCarousel'

const TYPING_PHRASES = [
  'ICT শিখুন সহজভাবে',
  'পদার্থবিজ্ঞান আয়ত্ত করুন',
  'রসায়নে দক্ষ হোন',
  'গণিতে ভালো রেজাল্ট করুন',
  'লাইভ ক্লাসে যোগ দিন'
]

const STATS = [
  { value: '৫০+', label: 'কোর্স' },
  { value: '১০,০০০+', label: 'শিক্ষার্থী' },
  { value: '৪.৯', label: 'রেটিং' }
]

function useTypingEffect(phrases, { typeSpeed = 70, deleteSpeed = 35, pause = 1400 } = {}) {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length]
    let timeout

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed)
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed)
    } else if (deleting && text.length === 0) {
      setDeleting(false)
      setPhraseIndex(i => (i + 1) % phrases.length)
    }

    return () => clearTimeout(timeout)
  }, [text, deleting, phraseIndex, phrases, typeSpeed, deleteSpeed, pause])

  return text
}

export default function Hero({ image }) {
  const typed = useTypingEffect(TYPING_PHRASES)

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-intro">
          <div className="hero-copy">
            <span className="hero-badge">ONLINE SCHOOL · LEARN WITH PURPOSE</span>
            <p className="hero-kicker">Quality Education for a Brighter Future</p>
            <h1 className="h1">Learn Today,<br /><span>Build Tomorrow</span></h1>
            <p className="hero-typing">{typed}<span className="typing-cursor">|</span></p>
            <p className="body">Learn from experienced teachers, access quality courses, and build the skills you need for a brighter future.</p>
            <div className="hero-actions">
              <a href="#courses" className="btn btn-primary">Explore Courses <span aria-hidden="true">↗</span></a>
              <a href="#contact" className="btn btn-outline">Contact Us</a>
            </div>
            <div className="hero-stats">
              {STATS.map(s => (
                <div className="hero-stat" key={s.label}>
                  <span className="hero-stat-value">{s.value}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="teacher-feature" id="teachers">
            <div className="teacher-glow" />
            <div className="teacher-frame">
              <img src="/images/teacher.png" alt="Online School teacher" width="1024" height="1024" />
            </div>
            <div className="teacher-card">
              <span className="teacher-card-mark">✦</span>
              <div><strong>Learn from a mentor</strong><small>Guidance that stays with you</small></div>
            </div>
          </div>
        </div>
        <div id="gallery"><ClassroomCarousel customImage={image} /></div>
      </div>
    </section>
  )
}
