import { useEffect, useState } from 'react'

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

export default function Hero({ image, overlay = 0.55 }) {
  const typed = useTypingEffect(TYPING_PHRASES)

  const style = image
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(8,10,16,${overlay}), rgba(8,10,16,${Math.min(overlay + 0.25, 0.92)})), url(${image})`
      }
    : {}

  return (
    <div className={`hero ${image ? 'hero-with-image' : ''}`} style={style}>
      <div className="container">
        <span className="hero-badge">HSC · SSC শিক্ষার্থীদের জন্য</span>
        <h1 className="h1">ICT সহ সব বিষয় শিখুন, লাইভ ক্লাসে একসাথে</h1>
        <p className="hero-typing">
          {typed}<span className="typing-cursor">|</span>
        </p>
        <p className="body">
          ভিডিও লেসন কিনুন, নির্দিষ্ট সময়ে লাইভ ক্লাসে যোগ দিন, ক্লাস শেষ হলেও রেকর্ডিং দেখে রিভিশন দিন।
        </p>
        <div className="hero-actions">
          <a href="#courses" className="btn btn-primary">কোর্স ব্রাউজ করুন</a>
          <a href="#courses" className="btn btn-outline">আমার কোর্স দেখুন</a>
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
    </div>
  )
}
