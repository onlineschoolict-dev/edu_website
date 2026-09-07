// If required Firebase env vars aren't set, initializing Firebase throws
// `auth/invalid-api-key` and the app shows a blank/broken screen.
// This checks for that up front and shows a clear, actionable message
// instead, so the cause is obvious in local dev AND on Vercel.

const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID'
]

export function getMissingFirebaseVars() {
  return REQUIRED_VARS.filter(key => !import.meta.env[key])
}

export default function ConfigCheck({ missing }) {
  return (
    <div className="container section" style={{ maxWidth: 640 }}>
      <h1 className="h2" style={{ marginBottom: 12 }}>⚙️ Firebase কনফিগারেশন দরকার</h1>
      <p className="body" style={{ marginBottom: 16 }}>
        সাইট চালানোর জন্য কিছু Firebase environment variable এখনো সেট করা হয়নি, তাই লগইন/ডেটা লোড কাজ করবে না
        (<code>auth/invalid-api-key</code> এরর দেখাবে)।
      </p>
      <div className="card" style={{ marginBottom: 16 }}>
        <b style={{ display: 'block', marginBottom: 8 }}>যা সেট করা নেই:</b>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {missing.map(key => <li key={key} className="body" style={{ marginBottom: 4 }}><code>{key}</code></li>)}
        </ul>
      </div>
      <p className="body" style={{ marginBottom: 8 }}>
        <b>লোকালে:</b> প্রজেক্ট রুটে <code>.env</code> ফাইল বানান (<code>.env.example</code> কপি করে), Firebase Console →
        Project settings → General → Your apps থেকে ভ্যালুগুলো বসান, তারপর ডেভ সার্ভার রিস্টার্ট করুন।
      </p>
      <p className="body">
        <b>Vercel-এ:</b> Project → Settings → Environment Variables-এ প্রতিটি ভ্যারিয়েবল যোগ করে আবার Deploy করুন।
      </p>
    </div>
  )
}
