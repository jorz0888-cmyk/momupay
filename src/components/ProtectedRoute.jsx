import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const wrapStyle = {
  minHeight: '100vh', background: '#FAF6F1',
  fontFamily: "'Zen Maru Gothic', sans-serif", color: '#2C2418',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
}
const cardStyle = {
  background: '#fff', borderRadius: 24, padding: '40px 32px',
  boxShadow: '0 8px 30px rgba(92,74,50,.08)',
  textAlign: 'center', maxWidth: 320, width: '100%',
}
const spinnerStyle = {
  width: 32, height: 32, borderRadius: '50%',
  border: '3px solid #E8DDD0', borderTopColor: '#C4745A',
  margin: '0 auto 14px',
  animation: 'momupay-protected-spin 0.9s linear infinite',
}
const labelStyle = { fontSize: 13, color: '#8B7355' }

const keyframes = `@keyframes momupay-protected-spin { to { transform: rotate(360deg) } }`

/**
 * Wraps a route that requires an authenticated Supabase session.
 *
 * Behavior:
 * - While the initial getSession() promise is pending, render a small
 *   centered spinner (NOT a blank screen — important for perceived
 *   performance on cold loads where supabase-js is still rehydrating
 *   the session from localStorage).
 * - If no session exists, redirect to /login. The original location is
 *   stashed in router state so a future enhancement can resume the user
 *   to where they were trying to go after sign-in.
 * - If a session exists, render the children unchanged.
 * - We also subscribe to onAuthStateChange so a sign-out happening in
 *   another tab kicks the user back to /login here too.
 */
function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading') // loading | authed | guest
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setStatus(session ? 'authed' : 'guest')
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setStatus(session ? 'authed' : 'guest')
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (status === 'loading') {
    return (
      <div style={wrapStyle}>
        <style>{keyframes}</style>
        <div style={cardStyle}>
          <div style={spinnerStyle} />
          <div style={labelStyle}>読み込み中...</div>
        </div>
      </div>
    )
  }

  if (status === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
