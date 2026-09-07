import { useState } from 'react'

const EMPTY = { name: '', role: '', quote: '' }

export default function TestimonialsEditor({ testimonials = [], updateSettings }) {
  const [form, setForm] = useState(EMPTY)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const add = async () => {
    if (!form.name.trim() || !form.quote.trim()) { alert('নাম ও মন্তব্য দিন।'); return }
    await updateSettings({ testimonials: [...testimonials, form] })
    setForm(EMPTY)
  }

  const remove = async (index) => {
    await updateSettings({ testimonials: testimonials.filter((_, i) => i !== index) })
  }

  return (
    <div>
      <h2 className="h3">টেস্টিমোনিয়াল / রিভিউ</h2>
      {testimonials.map((t, i) => (
        <div className="row" key={i}>
          <div>
            <b style={{ fontSize: 13 }}>{t.name}</b>
            <small>{t.quote}</small>
          </div>
          <div className="row-actions">
            <button onClick={() => remove(i)}>ডিলিট</button>
          </div>
        </div>
      ))}
      <div className="field"><label>শিক্ষার্থীর নাম</label>
        <input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
      <div className="field"><label>পরিচয় (ঐচ্ছিক, যেমনঃ HSC ২০২৫)</label>
        <input className="input" value={form.role} onChange={e => set('role', e.target.value)} /></div>
      <div className="field"><label>মন্তব্য</label>
        <input className="input" value={form.quote} onChange={e => set('quote', e.target.value)} /></div>
      <button className="btn btn-primary" style={{ width: '100%', padding: 10 }} onClick={add}>+ যোগ করুন</button>
    </div>
  )
}
