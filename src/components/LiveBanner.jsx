export default function LiveBanner({ liveClasses = [] }) {
  const live = liveClasses.find(l => l.status === 'live')
  const upcoming = !live
    ? liveClasses.filter(l => l.status === 'upcoming').sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0]
    : null

  const item = live || upcoming
  if (!item) return null

  const linkUrl = item.videoType === 'facebook' ? item.facebookUrl : item.youtubeUrl
  const platformLabel = item.videoType === 'facebook' ? 'Facebook' : 'YouTube'

  return (
    <div className="live-banner">
      <div className="live-banner-info">
        <span className={`pill ${live ? 'pill-live' : ''}`}>{live ? 'লাইভ চলছে' : 'আসছে লাইভ ক্লাস'}</span>
        <div>
          <div className="live-banner-title">{item.title}</div>
          <div className="live-banner-meta">{item.date} {item.time ? `· ${item.time}` : ''} · {platformLabel}</div>
        </div>
      </div>
      {linkUrl && (
        <a
          className={`btn ${live ? 'btn-primary' : 'btn-outline'}`}
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
        >
          {live ? 'এখনই যোগ দিন' : 'বিস্তারিত দেখুন'}
        </a>
      )}
    </div>
  )
}
