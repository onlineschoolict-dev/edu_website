import { useEffect, useState } from 'react'

const LOCAL_SLIDES = [
  { src: '/images/classroom-1.png', alt: 'Students learning together in a classroom' },
  { src: '/images/classroom-2.png', alt: 'A full classroom of students in discussion' },
  { src: '/images/classroom-3.png', alt: 'Students attending a coaching class' },
  { src: '/images/classroom-4.png', alt: 'Students taking part in an engaging class' }
]

export default function ClassroomCarousel({ customImage }) {
  const slides = customImage
    ? [...LOCAL_SLIDES, { src: customImage, alt: 'Students learning at Online School' }]
    : LOCAL_SLIDES
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [failedSlides, setFailedSlides] = useState([])

  useEffect(() => {
    if (paused || slides.length < 2) return undefined
    const timer = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % slides.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [paused, slides.length])

  const goTo = (index) => setActiveIndex((index + slides.length) % slides.length)
  const markFailed = (index) => setFailedSlides(current => [...new Set([...current, index])])

  return (
    <div
      className="classroom-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Student experience gallery"
    >
      <div className="classroom-slides">
        {slides.map((slide, index) => (
          <div
            className={`classroom-slide ${index === activeIndex ? 'active' : ''}`}
            key={`${slide.src}-${index}`}
            aria-hidden={index !== activeIndex}
          >
            {failedSlides.includes(index) ? (
              <div className="classroom-fallback">
                <span aria-hidden="true">◌</span>
                <strong>Our classroom community</strong>
              </div>
            ) : (
              <img
                src={slide.src}
                alt={slide.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                onError={() => markFailed(index)}
              />
            )}
          </div>
        ))}
        <div className="classroom-overlay" />
        <div className="classroom-caption">
          <span className="eyebrow">STUDENT EXPERIENCE</span>
          <h2>Learning feels better together.</h2>
          <p>Real classrooms, real questions, and a community that keeps moving forward.</p>
        </div>
        {slides.length > 1 && (
          <div className="classroom-controls">
            <button type="button" className="carousel-arrow" aria-label="Previous classroom photo" onClick={() => goTo(activeIndex - 1)}>←</button>
            <div className="carousel-dots" aria-label="Choose classroom photo">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  key={slide.src}
                  className={`carousel-dot ${index === activeIndex ? 'active' : ''}`}
                  aria-label={`Show classroom photo ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
            <button type="button" className="carousel-arrow" aria-label="Next classroom photo" onClick={() => goTo(activeIndex + 1)}>→</button>
          </div>
        )}
      </div>
    </div>
  )
}