// Small helper to turn any YouTube URL (or a bare 11-char video id) the admin
// pastes into a normalized video id + a ready-to-use embed URL.
// Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/live/ID,
// youtube.com/embed/ID, youtube.com/shorts/ID, and a bare video id.

const ID_RE = /^[a-zA-Z0-9_-]{11}$/

export function extractYouTubeId(input) {
  if (!input) return null
  const raw = String(input).trim()
  if (ID_RE.test(raw)) return raw

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return ID_RE.test(id) ? id : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v')
        return id && ID_RE.test(id) ? id : null
      }
      const parts = url.pathname.split('/').filter(Boolean)
      // /live/ID , /embed/ID , /shorts/ID
      if (parts.length >= 2 && ['live', 'embed', 'shorts'].includes(parts[0])) {
        return ID_RE.test(parts[1]) ? parts[1] : null
      }
    }
  } catch {
    // not a valid URL - fall through
  }
  return null
}

export function isLiveYouTubeUrl(input) {
  if (!input) return false
  try {
    const url = new URL(String(input).trim())
    return url.pathname.startsWith('/live/')
  } catch {
    return false
  }
}

export function buildYouTubeEmbedUrl(videoId, { autoplay = false } = {}) {
  if (!videoId) return null
  const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
  if (autoplay) params.set('autoplay', '1')
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}

export function buildYouTubeThumbnail(videoId) {
  if (!videoId) return null
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}
