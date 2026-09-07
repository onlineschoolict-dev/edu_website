import { useState } from 'react'

const EMPTY = { title: '', videoType: 'youtube', youtubeUrl: '', facebookUrl: '', date: '', time: '', status: 'upcoming' }

export default function LiveClassManager({ liveClasses, addLiveClass, updateLiveClass, deleteLiveClass }) {
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const isFacebook = form.videoType === 'facebook'

  const edit = (l) => { setEditId(l.id); setForm({ ...EMPTY, ...l }) }
  const reset = () => { setEditId(null); setForm(EMPTY) }

  const save = async () => {
    if (!form.title.trim()) { alert('টাইটেল দিন।'); return }
    if (isFacebook ? !form.facebookUrl.trim() : !form.youtubeUrl.trim()) {
      alert(isFacebook ? 'Facebook লাইভ/ভিডিও লিংক দিন।' : 'YouTube URL দিন।'); return
    }
    if (editId) await updateLiveClass(editId, form)
    else await addLiveClass(form)
    reset()
  }

  return (
    <div>
      <h2 className="h3">YouTube Live ক্লাস</h2>
      {liveClasses.length === 0 && <p className="body" style={{ fontSize: 13 }}>এখনো কোনো লাইভ ক্লাস যোগ করা হয়নি।</p>}
      {liveClasses.map(l => (
        <div className="row" key={l.id}>
          <div>
            <b style={{ fontSize: 13 }}>{l.title}</b>
            <small>{l.date} {l.time} · {l.status}</small>
          </div>
          <div className="row-actions">
            <button onClick={() => edit(l)}>এডিট</button>
            <button onClick={() => { if (confirm('ডিলিট করবেন?')) deleteLiveClass(l.id) }}>ডিলিট</button>
          </div>
        </div>
      ))}

      <div className="divider" />
      <h3 className="h3">{editId ? 'লাইভ ক্লাস এডিট করুন' : 'নতুন লাইভ ক্লাস যোগ করুন'}</h3>
      <div className="field"><label>টাইটেল</label>
        <input className="input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
      <div className="field"><label>প্ল্যাটফর্ম</label>
        <select className="input" value={form.videoType} onChange={e => set('videoType', e.target.value)}>
          <option value="youtube">YouTube</option>
          <option value="facebook">Facebook</option>
        </select></div>
      {isFacebook ? (
        <div className="field"><label>Facebook লাইভ/ভিডিও URL</label>
          <input className="input" value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://www.facebook.com/.../videos/..." /></div>
      ) : (
        <div className="field"><label>YouTube Live URL</label>
          <input className="input" value={form.youtubeUrl} onChange={e => set('youtubeUrl', e.target.value)} placeholder="https://youtube.com/live/..." /></div>
      )}
      <div className="field"><label>তারিখ</label>
        <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
      <div className="field"><label>সময়</label>
        <input className="input" type="time" value={form.time} onChange={e => set('time', e.target.value)} /></div>
      <div className="field"><label>স্ট্যাটাস</label>
        <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="upcoming">আসছে (Upcoming)</option>
          <option value="live">লাইভ চলছে (Live)</option>
          <option value="ended">শেষ (Ended)</option>
        </select>
      </div>
      <button className="btn btn-primary" style={{ width: '100%', padding: 12, marginBottom: 8 }} onClick={save}>সংরক্ষণ করুন</button>
      {editId && <button className="btn btn-outline" style={{ width: '100%', padding: 10 }} onClick={reset}>বাতিল</button>}
    </div>
  )
}
