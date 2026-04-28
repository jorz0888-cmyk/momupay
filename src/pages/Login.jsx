import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const s = {
  page: { minHeight: '100vh', background: '#FAF6F1', fontFamily: "'Zen Maru Gothic', sans-serif", color: '#2C2418' },
  header: { background: '#fff', borderBottom: '1px solid #E8DDD0', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: 36, height: 36, borderRadius: 10, background: '#2C2418', color: '#FAF6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 },
  logoText: { fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: '#2C2418' },
  logoAccent: { color: '#C4745A' },
  main: { maxWidth: 480, margin: '60px auto', padding: '0 24px 60px' },
  card: { background: '#fff', borderRadius: 24, padding: '40px 32px', boxShadow: '0 8px 30px rgba(92,74,50,.08)' },
  title: { fontSize: 24, fontWeight: 900, marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 14, color: '#5C4A32', lineHeight: 1.7, marginBottom: 28, textAlign: 'center' },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#2C2418' },
  input: { width: '100%', padding: '12px 16px', border: '1.5px solid #E8DDD0', borderRadius: 10, fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: 15, background: '#fff', color: '#2C2418', outline: 'none', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '15px 36px', border: 'none', borderRadius: 12, background: '#2C2418', color: '#FAF6F1', fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'block', position: 'relative', zIndex: 1 },
  error: { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 },
  success: { textAlign: 'center', padding: '20px 0' },
  successIcon: { width: 64, height: 64, borderRadius: '50%', background: '#EAF2EB', color: '#7A9E7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, margin: '0 auto 16px' },
  successTitle: { fontSize: 18, fontWeight: 900, marginBottom: 10 },
  successDesc: { color: '#5C4A32', fontSize: 14, lineHeight: 1.8 },
  hint: { fontSize: 12, color: '#8B7355', textAlign: 'center', marginTop: 14, lineHeight: 1.7 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#8B7355' },
  link: { color: '#C4745A', fontWeight: 700, textDecoration: 'none' },
}

const ERROR_MESSAGES = {
  invalid_link: 'リンクの有効期限が切れているか、無効です。もう一度ログインリンクをお送りします。',
  auth_failed: '認証に失敗しました。もう一度お試しください。',
}

function Login() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('')

  // Show error from query string (e.g. ?error=invalid_link from auth callback)
  const incomingErrorKey = params.get('error')
  const incomingError = incomingErrorKey ? (ERROR_MESSAGES[incomingErrorKey] || incomingErrorKey) : ''

  // If already logged in, send straight to dashboard.
  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) navigate('/dashboard', { replace: true })
    })
    return () => { mounted = false }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setStatus('sending'); setErrorMsg('')
    // Clear any incoming error param so it doesn't flicker after success
    if (incomingErrorKey) {
      const next = new URLSearchParams(params); next.delete('error'); setParams(next, { replace: true })
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
      setStatus('sent')
    } catch (err) {
      setErrorMsg(err?.message || 'ログインリンクの送信に失敗しました')
      setStatus('error')
    }
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={s.logoMark}>M</div>
          <span style={s.logoText}>Momu<span style={s.logoAccent}>Pay</span></span>
        </Link>
      </header>

      <main style={s.main}>
        <div style={s.card}>
          {status === 'sent' ? (
            <div style={s.success}>
              <div style={s.successIcon}>✓</div>
              <h1 style={s.successTitle}>メールをお送りしました</h1>
              <p style={s.successDesc}>
                <strong>{email}</strong> 宛にログインリンクをお送りしました。<br />
                メール内のリンクをクリックしてログインしてください。
              </p>
              <p style={s.hint}>
                ※ 数分経っても届かない場合は迷惑メールフォルダをご確認ください。<br />
                それでも届かない場合は、もう一度お試しいただくか<br />
                info@momupay.com までご連絡ください。
              </p>
            </div>
          ) : (
            <>
              <h1 style={s.title}>おかえりなさい</h1>
              <p style={s.sub}>
                ご登録のメールアドレスに<br />
                ログインリンクをお送りします。
              </p>

              {(status === 'error' && errorMsg) && <div style={s.error}>{errorMsg}</div>}
              {status !== 'error' && incomingError && <div style={s.error}>{incomingError}</div>}

              <form onSubmit={handleSubmit}>
                <div style={s.field}>
                  <label style={s.label}>メールアドレス</label>
                  <input
                    style={s.input}
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
                <button
                  type="submit"
                  style={{ ...s.btn, ...(status === 'sending' || !email.trim() ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
                  disabled={status === 'sending' || !email.trim()}
                >
                  {status === 'sending' ? '送信中...' : 'ログインリンクを送る'}
                </button>
              </form>
            </>
          )}
        </div>
        <div style={s.footer}>
          まだご登録でない方は<Link to="/register" style={s.link}>こちら</Link>
        </div>
      </main>
    </div>
  )
}

export default Login
