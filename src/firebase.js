import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Fail loudly and clearly here instead of letting the Firebase SDK throw a
// cryptic "auth/invalid-api-key" later from deep inside getAuth(). Missing
// env vars are the #1 cause of that error - Vite only injects VITE_* vars
// that exist in a real `.env` (or `.env.local`) file / in your Vercel
// project's Environment Variables, and only at server-start/build time
// (not hot-reloaded), so a missing file or a not-yet-restarted dev server
// both produce `undefined` here.
const REQUIRED_CONFIG_KEYS = ['apiKey', 'authDomain', 'projectId', 'appId']

const missing = REQUIRED_CONFIG_KEYS.filter((key) => !firebaseConfig[key])

if (missing.length > 0) {
  throw new Error(
    `Firebase config is missing: ${missing.join(', ')}. ` +
    'Create a .env file in the project root (copy .env.example to .env) and fill in ' +
    'these values from Firebase Console -> Project settings -> General -> "Your apps" -> ' +
    'SDK setup and configuration -> Config. If you just created/edited .env, restart ' +
    '`npm run dev` (Vite only reads env files on server start). On Vercel, add the same ' +
    'VITE_ variables under Project Settings -> Environment Variables and redeploy.'
  )
}

// getApps()/getApp() guards against re-initializing if this module is ever
// evaluated more than once (e.g. Vite HMR edge cases) - initializeApp()
// throws if called twice with an app of the same name.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL
export const analytics = isSupported().then((supported) => (supported ? getAnalytics(app) : null))
