// Small helper for Facebook video/live URLs.
// We do NOT have Facebook API credentials, so we can only use Facebook's
// official public embed (plugins/video.php), which works for public videos
// that the page owner has allowed to be embedded. If a video isn't
// embeddable, the iframe will simply show Facebook's own "content
// unavailable" message - we always render a real "Watch on Facebook" link
// alongside the embed so the student can still reach the video.

export function isFacebookUrl(input) {
  if (!input) return false
  try {
    const url = new URL(String(input).trim())
    const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '')
    return host === 'facebook.com' || host === 'fb.watch'
  } catch {
    return false
  }
}

export function buildFacebookEmbedUrl(rawUrl) {
  if (!rawUrl) return null
  const href = encodeURIComponent(String(rawUrl).trim())
  return `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false`
}
