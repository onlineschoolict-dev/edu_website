import { useState } from 'react'

const EMPTY = { titleBn: '', titleEn: '', descriptionBn: '', descriptionEn: '', image: '', link: '', positions: ['homepage'], enabled: true, startDate: '', endDate: '' }

export default function AdvertisementManager({ advertisements = [], updateSettings }) {
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const togglePosition = (position) => set('positions', form.positions.includes(position) ? form.positions.filter(item => item !== position) : [...form.positions, position])

  const reset = () => { setForm(EMPTY); setEditId(null) }
  const save = async () => {
    if (!form.titleBn.trim() && !form.titleEn.trim()) { alert('বিজ্ঞাপনের শিরোনাম দিন।'); return }
    if (!form.positions.length) { alert('কমপক্ষে একটি অবস্থান নির্বাচন করুন।'); return }
    const item = { ...form, id: editId || `ad_${Date.now()}` }
    const next = editId ? advertisements.map(ad => ad.id === editId ? item : ad) : [...advertisements, item]
    await updateSettings({ advertisements: next })
    reset()
  }
  const edit = (ad) => { setEditId(ad.id); setForm({ ...EMPTY, ...ad }) }
  const remove = async (id) => { if (confirm('এই বিজ্ঞাপনটি ডিলিট করবেন?')) await updateSettings({ advertisements: advertisements.filter(ad => ad.id !== id) }) }
  const toggle = async (ad) => updateSettings({ advertisements: advertisements.map(item => item.id === ad.id ? { ...item, enabled: item.enabled === false } : item) })

  return <div className="admin-ad-manager">
    <div className="admin-section-intro"><span className="admin-kicker">CAMPAIGNS</span><h2>বিজ্ঞাপন ম্যানেজমেন্ট</h2><p>বিজ্ঞাপন চালু/বন্ধ করুন এবং কোন পেজে দেখাবে তা ঠিক করুন।</p></div>
    {advertisements.map(ad => <div className="row" key={ad.id}><div><b>{ad.titleBn || ad.titleEn}</b><small>{ad.enabled === false ? 'বন্ধ' : 'চালু'} · {ad.positions?.join(', ')}</small></div><div className="row-actions"><button onClick={() => toggle(ad)}>{ad.enabled === false ? 'চালু' : 'বন্ধ'}</button><button onClick={() => edit(ad)}>এডিট</button><button onClick={() => remove(ad.id)}>ডিলিট</button></div></div>)}
    {advertisements.length === 0 && <div className="admin-empty"><span>▱</span><p>এখনো কোনো বিজ্ঞাপন নেই।</p></div>}
    <div className="admin-ad-form">
      <h3 className="h3">{editId ? 'বিজ্ঞাপন এডিট করুন' : 'নতুন বিজ্ঞাপন যোগ করুন'}</h3>
      <div className="admin-form-grid"><div className="field"><label>শিরোনাম (বাংলা)</label><input className="input" value={form.titleBn} onChange={e => set('titleBn', e.target.value)} /></div><div className="field"><label>Title (English)</label><input className="input" value={form.titleEn} onChange={e => set('titleEn', e.target.value)} /></div></div>
      <div className="admin-form-grid"><div className="field"><label>বিবরণ (বাংলা)</label><textarea className="input" value={form.descriptionBn} onChange={e => set('descriptionBn', e.target.value)} /></div><div className="field"><label>Description (English)</label><textarea className="input" value={form.descriptionEn} onChange={e => set('descriptionEn', e.target.value)} /></div></div>
      <div className="field"><label>ছবির URL (ঐচ্ছিক)</label><input className="input" value={form.image} onChange={e => set('image', e.target.value)} /></div>
      <div className="field"><label>লিংক (ঐচ্ছিক)</label><input className="input" value={form.link} onChange={e => set('link', e.target.value)} /></div>
      <div className="admin-check-list">{[['homepage', 'হোমপেজ'], ['course', 'কোর্স পেজ'], ['dashboard', 'স্টুডেন্ট ড্যাশবোর্ড']].map(([id, label]) => <label key={id} className="admin-check-row"><input type="checkbox" checked={form.positions.includes(id)} onChange={() => togglePosition(id)} />{label}</label>)}</div>
      <div className="admin-form-grid"><div className="field"><label>শুরু তারিখ</label><input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div><div className="field"><label>শেষ তারিখ</label><input className="input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div></div>
      <button className="btn btn-primary" onClick={save}>{editId ? 'পরিবর্তন সংরক্ষণ করুন' : 'বিজ্ঞাপন যোগ করুন'}</button>{editId && <button className="btn btn-outline" onClick={reset} style={{ marginLeft: 8 }}>বাতিল</button>}
    </div>
  </div>
}