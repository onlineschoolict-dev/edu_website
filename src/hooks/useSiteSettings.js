import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { uploadImage } from '../utils/storage'

const DOC = doc(db, 'settings', 'site')

const DEFAULTS = {
  siteName: 'Online School',
  heroImage: '',
  heroOverlay: 0.55, // 0 = no dark overlay, 1 = fully dark
  onlinePaymentEnabled: false,
  testimonials: []
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(DOC, (snap) => {
      setSettings(snap.exists() ? { ...DEFAULTS, ...snap.data() } : DEFAULTS)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [])

  const updateSettings = (data) => setDoc(DOC, data, { merge: true })

  // Uploads a File to Cloudinary (see src/utils/storage.js) and saves the
  // resulting URL as heroImage in Firestore.
  const uploadHeroImage = async (file) => {
    if (!file) return
    const url = await uploadImage('site', file)
    await updateSettings({ heroImage: url })
    return url
  }

  return { settings, loading, updateSettings, uploadHeroImage }
}
