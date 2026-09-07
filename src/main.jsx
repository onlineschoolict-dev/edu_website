import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ConfigCheck, { getMissingFirebaseVars } from './components/ConfigCheck.jsx'
import { LanguageProvider } from './i18n.jsx'
import './index.css'

const App = lazy(() => import('./App.jsx'))
const AdminApp = lazy(() => import('./AdminApp.jsx'))

// Set VITE_APP_MODE=admin in a second Vercel project's environment variables
// to deploy this same codebase as a separate admin-only site (e.g.
// admin.yourdomain.com) that never ships any student-facing route.
const isAdminMode = import.meta.env.VITE_APP_MODE === 'admin'

// Catches missing/blank Firebase env vars before firebase.js tries to
// initialize with them (which otherwise fails later with a confusing
// `auth/invalid-api-key` error and a blank screen).
const missingVars = getMissingFirebaseVars()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      {missingVars.length > 0 ? (
        <ConfigCheck missing={missingVars} />
      ) : (
        <BrowserRouter>
          <Suspense fallback={<div className="app-loading" aria-label="Loading" />}>
            {isAdminMode ? <AdminApp /> : <App />}
          </Suspense>
        </BrowserRouter>
      )}
    </LanguageProvider>
  </React.StrictMode>
)
