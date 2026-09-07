import { useState } from 'react'
import {
  useCurriculum, addModule, updateModule, deleteModule,
  addLesson, updateLesson, deleteLesson, swapOrder,
  moduleCollectionRef, lessonCollectionRef
} from '../../hooks/useCurriculum'
import { extractYouTubeId, buildYouTubeEmbedUrl } from '../../utils/youtube'

const EMPTY_LESSON = { title: '', videoType: 'youtube', youtubeId: '', facebookUrl: '', description: '', duration: '', isDemo: false }

function LessonForm({ courseId, moduleId, initial, onDone }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_LESSON,
    ...initial,
    youtubeId: extractYouTubeId(initial?.youtubeId || initial?.youtubeUrl) || ''
  }))
  const [order] = useState(initial?.order)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const isFacebook = form.videoType === 'facebook'
  const previewId = !isFacebook ? extractYouTubeId(form.youtubeId) : null

  const save = async () => {
    if (!form.title.trim()) { alert('লেসনের নাম দিন।'); return }
    if (isFacebook) {
      if (!form.facebookUrl.trim()) { alert('Facebook ভিডিও/লাইভের লিংক দিন।'); return }
    } else if (!extractYouTubeId(form.youtubeId)) {
      alert('সঠিক YouTube URL বা ভিডিও আইডি দিন।'); return
    }
    const lessonData = {
      title: form.title,
      videoType: form.videoType,
      youtubeId: isFacebook ? '' : extractYouTubeId(form.youtubeId),
      facebookUrl: isFacebook ? form.facebookUrl : '',
      description: form.description,
      duration: form.duration,
      order: order ?? 0
    }
    if (initial?.id) {
      await updateLesson(courseId, moduleId, initial.id, lessonData)
    } else {
      await addLesson(courseId, moduleId, { ...lessonData, order: Date.now() })
    }
    onDone()
  }

  return (
    <div className="row" style={{ flexDirection: 'column', alignItems: 'stretch', background: 'hsl(var(--secondary) / .6)' }}>
      <div className="field"><label>লেসনের নাম</label>
        <input className="input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
      <div className="field"><label>ভিডিওর ধরন</label>
        <select className="input" value={form.videoType} onChange={e => set('videoType', e.target.value)}>
          <option value="youtube">YouTube</option>
          <option value="facebook">Facebook</option>
        </select></div>
      {isFacebook ? (
        <div className="field"><label>Facebook ভিডিও/লাইভ URL</label>
          <input className="input" value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://www.facebook.com/.../videos/..." /></div>
      ) : (
        <div className="field"><label>YouTube ভিডিও ID বা URL</label>
          <input className="input" value={form.youtubeId} onChange={e => set('youtubeId', e.target.value)} placeholder="ভিডিও ID অথবা YouTube URL পেস্ট করুন" /></div>
      )}
      {previewId && (
        <div className="video-wrap" style={{ maxWidth: 320 }}>
          <iframe
            src={buildYouTubeEmbedUrl(previewId)}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="preview"
          />
        </div>
      )}
      <div className="field"><label>বিবরণ (ঐচ্ছিক)</label>
        <input className="input" value={form.description} onChange={e => set('description', e.target.value)} /></div>
      <div className="field"><label>স্থিতিকাল (ঐচ্ছিক, যেমন 12:30)</label>
        <input className="input" value={form.duration} onChange={e => set('duration', e.target.value)} /></div>
      <label className="admin-check-row"><input type="checkbox" checked={form.isDemo === true} onChange={e => set('isDemo', e.target.checked)} /> ফ্রি ডেমো ক্লাস হিসেবে দেখান</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={save}>সেভ</button>
        <button className="btn btn-outline" onClick={onDone}>বাতিল</button>
      </div>
    </div>
  )
}

function ModuleBlock({ courseId, module, lessons }) {
  const [addingLesson, setAddingLesson] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(module.title)

  const saveTitle = async () => {
    if (title.trim()) await updateModule(courseId, module.id, { title: title.trim() })
    setEditingTitle(false)
  }

  const moveLesson = async (index, dir) => {
    const target = index + dir
    if (target < 0 || target >= lessons.length) return
    await swapOrder(lessonCollectionRef(courseId, module.id), lessons[index], lessons[target])
  }

  return (
    <div className="curriculum-module">
      <div className="curriculum-module-head" style={{ cursor: 'default' }}>
        {editingTitle ? (
          <div style={{ display: 'flex', gap: 6, flex: 1 }}>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
            <button className="btn btn-outline" onClick={saveTitle}>সেভ</button>
          </div>
        ) : (
          <span onClick={() => setEditingTitle(true)} style={{ cursor: 'pointer' }}>{module.title} ✎</span>
        )}
        <button
          className="btn btn-outline"
          style={{ padding: '4px 8px', fontSize: 12 }}
          onClick={() => { if (confirm('এই মডিউল ও এর সব লেসন ডিলিট করবেন?')) deleteModule(courseId, module.id) }}
        >
          মডিউল ডিলিট
        </button>
      </div>

      {lessons.map((l, i) => (
        editingLessonId === l.id ? (
          <LessonForm key={l.id} courseId={courseId} moduleId={module.id} initial={l} onDone={() => setEditingLessonId(null)} />
        ) : (
          <div className="curriculum-lesson" key={l.id} style={{ justifyContent: 'space-between' }}>
            <span>{i + 1}. {l.title} {l.duration ? `· ${l.duration}` : ''}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div className="reorder-btns">
                <button onClick={() => moveLesson(i, -1)} disabled={i === 0}>▲</button>
                <button onClick={() => moveLesson(i, 1)} disabled={i === lessons.length - 1}>▼</button>
              </div>
              <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setEditingLessonId(l.id)}>এডিট</button>
              <button
                className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }}
                onClick={() => { if (confirm('লেসন ডিলিট করবেন?')) deleteLesson(courseId, module.id, l.id) }}
              >
                ডিলিট
              </button>
            </div>
          </div>
        )
      ))}

      {addingLesson ? (
        <LessonForm courseId={courseId} moduleId={module.id} onDone={() => setAddingLesson(false)} />
      ) : (
        <button className="btn btn-outline" style={{ margin: 10, width: 'calc(100% - 20px)' }} onClick={() => setAddingLesson(true)}>
          + লেসন যোগ করুন
        </button>
      )}
    </div>
  )
}

export default function CurriculumManager({ courseId }) {
  const { modules } = useCurriculum(courseId)
  const [newModuleTitle, setNewModuleTitle] = useState('')

  const addNewModule = async () => {
    if (!newModuleTitle.trim()) return
    await addModule(courseId, newModuleTitle.trim(), Date.now())
    setNewModuleTitle('')
  }

  const moveModule = async (index, dir) => {
    const target = index + dir
    if (target < 0 || target >= modules.length) return
    await swapOrder(moduleCollectionRef(courseId), modules[index], modules[target])
  }

  return (
    <div>
      {modules.map((m, i) => (
        <div key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div className="reorder-btns" style={{ marginTop: 14 }}>
            <button onClick={() => moveModule(i, -1)} disabled={i === 0}>▲</button>
            <button onClick={() => moveModule(i, 1)} disabled={i === modules.length - 1}>▼</button>
          </div>
          <div style={{ flex: 1 }}>
            <ModuleBlock courseId={courseId} module={m} lessons={m.lessons} />
          </div>
        </div>
      ))}

      <div className="field" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input className="input" placeholder="নতুন মডিউলের নাম (যেমনঃ মডিউল ১: শুরু)" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} />
        <button className="btn btn-primary" onClick={addNewModule}>+ মডিউল যোগ করুন</button>
      </div>
    </div>
  )
}
