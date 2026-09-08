import { useEffect, useRef, useState } from 'react'
import { addLiveComment, removeLiveComment, useLiveComments } from '../hooks/useLiveComments'

export default function LiveComments({ liveClass, user, login, isAdmin }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const listRef = useRef(null)
  const { comments, loading } = useLiveComments(liveClass?.id)

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [comments.length])

  if (!liveClass) return null

  const submit = async event => {
    event.preventDefault()
    if (!user) { login(); return }
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await addLiveComment({ liveClassId: liveClass.id, user, text })
      setText('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="card live-comments" aria-label="লাইভ ক্লাস কমেন্ট">
      <div className="section-head" style={{ marginBottom: 12 }}>
        <div><h3 className="h3" style={{ marginBottom: 4 }}>লাইভ ক্লাস চ্যাট</h3><p className="body" style={{ fontSize: 12, margin: 0 }}>{liveClass.title}</p></div>
      </div>
      <div className="live-comments-list" ref={listRef} aria-live="polite">
        {loading && <p className="body">কমেন্ট লোড হচ্ছে...</p>}
        {!loading && comments.length === 0 && <p className="body">এখনো কোনো কমেন্ট নেই। প্রথম কমেন্টটি করুন।</p>}
        {comments.map(comment => (
          <div className="live-comment" key={comment.id}>
            <div className="live-comment-avatar">{(comment.userName || 'শি').slice(0, 1)}</div>
            <div className="live-comment-content"><strong>{comment.userName || 'শিক্ষার্থী'}</strong><p>{comment.text}</p></div>
            {(isAdmin || comment.userId === user?.uid) && <button type="button" className="live-comment-delete" aria-label="কমেন্ট মুছুন" onClick={() => removeLiveComment(comment.id)}>×</button>}
          </div>
        ))}
      </div>
      {user ? (
        <form className="live-comments-form" onSubmit={submit}>
          <input className="input" value={text} onChange={event => setText(event.target.value)} maxLength={500} placeholder="আপনার কমেন্ট লিখুন..." aria-label="কমেন্ট" />
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? '...' : 'পাঠান'}</button>
        </form>
      ) : (
        <button type="button" className="btn btn-outline" onClick={login}>কমেন্ট করতে লগইন করুন</button>
      )}
    </section>
  )
}
