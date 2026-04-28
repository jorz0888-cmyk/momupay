import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const s = {
  page: {
    minHeight: '100vh', background: '#FAF6F1',
    fontFamily: "'Zen Maru Gothic', sans-serif", color: '#2C2418',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24,
  },
  card: {
    background: '#fff', borderRadius: 24, padding: '48px 32px',
    boxShadow: '0 8px 30px rgba(92,74,50,.08)',
    textAlign: 'center', maxWidth: 380, width: '100%',
  },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '3px solid #E8DDD0', borderTopColor: '#C4745A',
    margin: '0 auto 18px',
    animation: 'momupay-auth-spin 0.9s linear infinite',
  },
  msg: { fontSize: 14, color: '#5C4A32' },
}

const keyframes = `@keyframes momupay-auth-spin { to { transform: rotate(360deg) } }`

function AuthCallback() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('ログイン処理中です...')

  useEffect(() => {
    let cancelled = false

    const finish = (path) => {
      if (cancelled) return
      navigate(path, { replace: true })
    }

    const exchange = async () => {
      try {
        // PKCE flow returns ?code=... in the URL on success.
        // (Implicit flow returns tokens in the URL hash and is auto-
        //  consumed by supabase-js during init via detectSessionInUrl.)
        const code = new URLSearchParams(window.location.search).get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            finish('/login?error=invalid_link')
            return
          }
        }

        // Either flow ends here: the session should be live.
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          finish('/dashboard')
        } else {
          finish('/login?error=invalid_link')
        }
      } catch {
        finish('/login?error=auth_failed')
      }
    }

    // onAuthStateChange catches the case where the implicit flow finishes
    // its hash-token parse slightly after this effect runs.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) finish('/dashboard')
    })

    exchange()

    // Hard cap so a broken / expired link doesn't trap the user on this
    // screen forever.
    const timeout = setTimeout(() => {
      setMessage('リンクが無効か期限切れのようです。ログイン画面に戻ります。')
      setTimeout(() => finish('/login?error=invalid_link'), 1500)
    }, 8000)

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div style={s.page}>
      <style>{keyframes}</style>
      <div style={s.card}>
        <div style={s.spinner} />
        <p style={s.msg}>{message}</p>
      </div>
    </div>
  )
}

export default AuthCallback
