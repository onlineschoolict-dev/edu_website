import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Uses a Firebase service account (server-side only — never exposed to the browser).
// Set these in Vercel Project Settings -> Environment Variables:
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY   (paste the private key; keep the \n line breaks, e.g. wrap in quotes)
function getAdminApp() {
  if (getApps().length) return getApps()[0]

  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey
    })
  })
}

export const adminDb = getFirestore(getAdminApp())
