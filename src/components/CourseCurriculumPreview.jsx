import { useState } from 'react'

export default function CourseCurriculumPreview({ modules, unlocked }) {
  const [openId, setOpenId] = useState(modules[0]?.id)

  if (!modules.length) return null

  return (
    <div style={{ marginBottom: 24 }}>
      {modules.map((m, mi) => (
        <div className="curriculum-module" key={m.id}>
          <div className="curriculum-module-head" onClick={() => setOpenId(o => o === m.id ? null : m.id)}>
            <span>মডিউল {mi + 1}: {m.title}</span>
            <span className="body" style={{ fontSize: 12 }}>{m.lessons.length} লেসন {openId === m.id ? '▲' : '▼'}</span>
          </div>
          {openId === m.id && m.lessons.map((l, li) => (
            <div className="curriculum-lesson" key={l.id}>
              <span className="curriculum-lesson-icon">{unlocked ? '▶' : '🔒'}</span>
              <span>{li + 1}. {l.title}</span>
              {l.duration && <span style={{ marginLeft: 'auto' }}>{l.duration}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
