import { buildYouTubeEmbedUrl, extractYouTubeId } from '../utils/youtube'
import { buildFacebookEmbedUrl } from '../utils/facebook'

// videoType: 'youtube' (default) | 'facebook'
export default function VideoEmbed({ videoType = 'youtube', url, videoId, title, autoplay = false }) {
  if (videoType === 'facebook') {
    if (!url) {
      return (
        <div className="video-wrap">
          <div className="note" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ভিডিও লিংক পাওয়া যায়নি।
          </div>
        </div>
      )
    }
    return (
      <div className="video-wrap">
        <iframe
          src={buildFacebookEmbedUrl(url)}
          title={title}
          allowFullScreen
          loading="lazy"
          scrolling="no"
          frameBorder="0"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </div>
    )
  }

  const normalizedVideoId = extractYouTubeId(videoId)
  return (
    <div className="video-wrap">
      {normalizedVideoId ? (
        <iframe
          src={buildYouTubeEmbedUrl(normalizedVideoId, { autoplay })}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title={title}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="note" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ভিডিও লিংক পাওয়া যায়নি।
        </div>
      )}
    </div>
  )
}
