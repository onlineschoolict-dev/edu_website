import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n'

export default function CourseCurriculumPreview({ courseId, modules, unlocked }) {
  const { t, localized } = useLanguage()
  const [openId, setOpenId] = useState(modules[0]?.id)

  if (!modules.length) return null

  return (
    <div style={{ marginBottom: 24 }}>
      {modules.map((m, mi) => (
        <div className="curriculum-module" key={m.id}>
          <div className="curriculum-module-head" onClick={() => setOpenId(o => o === m.id ? null : m.id)}>
            <span>{m.title}</span>
            <span className="body" style={{ fontSize: 12 }}>{m.lessons.length} {t('lessons')} {openId === m.id ? '▲' : '▼'}</span>
          </div>
          {openId === m.id && m.lessons.map((l, li) => (
            <div className="curriculum-lesson" key={l.id}>
              <span className="curriculum-lesson-icon">{unlocked || l.isDemo ? '▶' : '🔒'}</span>
              <span>{li + 1}. {localized(l, 'title')}</span>
              {l.duration && <span style={{ marginLeft: 'auto' }}>{l.duration}</span>}
              {l.isDemo && <Link className="demo-watch-link" to={`/learn/${courseId}?lesson=${l.id}`}>{t('watchDemo')}</Link>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
