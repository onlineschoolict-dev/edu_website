import { buildYouTubeEmbedUrl, extractYouTubeId } from '../utils/youtube'
import { buildFacebookEmbedUrl } from '../utils/facebook'

// videoType: 'youtube' (default) | 'facebook'
export default function VideoEmbed({ videoType = 'youtube', url, title, autoplay = false }) {
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
      <>
        <div className="video-wrap">
          <iframe
            src={buildFacebookEmbedUrl(url)}
            title={title}
            allowFullScreen
            scrolling="no"
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
          />
        </div>
        {/* Facebook only allows embedding when the page owner has enabled it.
            This link always works as a fallback if the embed above looks empty/blocked. */}
        <a href={url} target="_blank" rel="noreferrer" className="body" style={{ fontSize: 13, display: 'inline-block', marginTop: -8, marginBottom: 16 }}>
          ভিডিও না দেখা গেলে সরাসরি Facebook-এ দেখুন →
        </a>
      </>
    )
  }

  const videoId = extractYouTubeId(url)
  return (
    <div className="video-wrap">
      {videoId ? (
        <iframe src={buildYouTubeEmbedUrl(videoId, { autoplay })} allowFullScreen title={title} />
      ) : (
        <div className="note" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ভিডিও লিংক পাওয়া যায়নি।
        </div>
      )}
    </div>
  )
}
