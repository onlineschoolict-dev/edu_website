import { deleteReview, moderateReview } from '../../hooks/useReviews'
import { Stars } from '../StudentReviews'

export default function ReviewsManager({ reviews = [], courses = [], notify }) {
  const pending = reviews.filter(review => review.status === 'pending')
  const visible = reviews.filter(review => review.status !== 'approved')

  const update = async (review, status) => {
    await moderateReview(review.id, status)
    notify(status === 'approved' ? 'রিভিউ অনুমোদিত হয়েছে।' : 'রিভিউ বাতিল হয়েছে।')
  }

  return (
    <div>
      <div className="admin-section-intro"><h2>Student reviews</h2><p>{pending.length}টি রিভিউ অনুমোদনের অপেক্ষায় আছে।</p></div>
      {visible.length === 0 && <div className="admin-empty"><span>★</span><p>কোনো pending বা rejected রিভিউ নেই।</p></div>}
      {visible.map(review => {
        const course = courses.find(item => item.id === review.courseId)
        return (
          <div className="row" key={review.id}>
            <div style={{ minWidth: 0 }}>
              <b style={{ fontSize: 13 }}>{course?.title || review.courseId}</b>
              <small style={{ display: 'block' }}>{review.userName || review.userId} · <Stars value={review.rating} /></small>
              <p className="body" style={{ margin: '6px 0 0', fontSize: 13 }}>{review.comment}</p>
            </div>
            <div className="row-actions">
              <span className={`admin-status ${review.status}`}>{review.status}</span>
              {review.status !== 'approved' && <button onClick={() => update(review, 'approved')}>অনুমোদন</button>}
              {review.status === 'pending' && <button onClick={() => update(review, 'rejected')}>বাতিল</button>}
              <button onClick={async () => { if (confirm('এই রিভিউটি ডিলিট করবেন?')) { await deleteReview(review.id); notify('রিভিউ ডিলিট হয়েছে।') } }}>ডিলিট</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
