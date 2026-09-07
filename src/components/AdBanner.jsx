import { useLanguage } from '../i18n'

export default function AdBanner({ ads = [], position, adsEnabled = true }) {
  const { language } = useLanguage()
  const now = new Date()
  const visible = adsEnabled && ads.find(ad => {
    if (ad.enabled === false || !ad.positions?.includes(position)) return false
    if (ad.startDate && new Date(`${ad.startDate}T00:00:00`) > now) return false
    if (ad.endDate && new Date(`${ad.endDate}T23:59:59`) < now) return false
    return ad.image || ad.title
  })

  if (!visible) return null
  const title = language === 'bn' ? (visible.titleBn || visible.titleEn || visible.title) : (visible.titleEn || visible.titleBn || visible.title)
  const description = language === 'bn' ? (visible.descriptionBn || visible.descriptionEn || visible.description) : (visible.descriptionEn || visible.descriptionBn || visible.description)
  const content = <div className="ad-banner-content">{visible.image && <img src={visible.image} alt="" /> }<div><strong>{title}</strong>{description && <span>{description}</span>}</div></div>
  return visible.link ? <a className="ad-banner" href={visible.link} target="_blank" rel="noopener noreferrer">{content}</a> : <div className="ad-banner">{content}</div>
}