import { useEffect, useState } from 'react'
import { getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth'
import { auth, googleProvider, ADMIN_EMAIL } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      if (error?.code !== 'auth/no-auth-event') {
        console.error('[Firebase Auth] Redirect sign-in failed', error)
        setAuthError(error)
      }
    })
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      if (u) setAuthError(null)
    }, (error) => {
      console.error('[Firebase Auth] Auth state error', {
        code: error.code,
        message: error.message,
        error
      })
      setLoading(false)
      setAuthError(error)
    })
    return unsub
  }, [])

  const login = async () => {
    setAuthError(null)

    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (!result?.user) {
        throw new Error('Firebase Google sign-in completed without a user.')
      }

      setUser(result.user)
      console.info('[Firebase Auth] Google sign-in successful', {
        uid: result.user.uid,
        email: result.user.email
      })
      return result.user
    } catch (error) {
      const knownCodes = new Set([
        'auth/invalid-api-key',
        'auth/unauthorized-domain',
        'auth/popup-blocked',
        'auth/popup-closed-by-user',
        'auth/operation-not-allowed'
      ])
      const code = error?.code || 'auth/unknown'

      if (knownCodes.has(code)) {
        console.error(`[Firebase Auth] Google sign-in failed: ${code}`, error)
      } else {
        console.error('[Firebase Auth] Google sign-in failed', error)
      }

      if (code === 'auth/popup-blocked') {
        console.info('[Firebase Auth] Popup blocked; starting redirect sign-in.')
        return signInWithRedirect(auth, googleProvider)
      }

      setAuthError(error)
      return null
    }
  }

  const logout = () => signOut(auth)
  const authenticatedEmail = auth.currentUser?.email
  const isAdmin = !loading && !!user && authenticatedEmail?.trim().toLowerCase() === ADMIN_EMAIL

  return { user, loading, login, logout, isAdmin, authError }
}
