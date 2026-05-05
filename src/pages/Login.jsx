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
  codeInput: {
    width: '100%', padding: '18px 16px',
    border: '1.5px solid #E8DDD0', borderRadius: 12,
    background: '#fff', color: '#2C2418', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    fontSize: 28, fontWeight: 700,
    letterSpacing: '0.5em', textAlign: 'center',
    // The trailing letter-spacing widens the right edge; pull the visual
    // back so the digits read centered under the caption.
    paddingLeft: 'calc(16px + 0.25em)',
    paddingRight: 16,
  },
  btn: { width: '100%', padding: '15px 36px', border: 'none', borderRadius: 12, background: '#2C2418', color: '#FAF6F1', fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'block', position: 'relative', zIndex: 1 },
  btnSecondary: {
    width: '100%', padding: '12px 24px',
    border: '1.5px solid #E8DDD0', borderRadius: 12,
    background: 'transparent', color: '#5C4A32',
    fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 700, fontSize: 13,
    cursor: 'pointer', display: 'block', marginTop: 10,
  },
  error: { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 },
  emailNotice: {
    background: '#FAF6F1', borderRadius: 10,
    padding: '12px 14px', marginBottom: 24,
    fontSize: 13, color: '#5C4A32', textAlign: 'center', lineHeight: 1.7,
  },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#8B7355' },
  link: { color: '#C4745A', fontWeight: 700, textDecoration: 'none' },
  resendRow: { textAlign: 'center', marginTop: 16, fontSize: 13 },
  resendLink: { color: '#C4745A', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' },
}

// Errors that AuthCallback may forward via ?error= for users still
// arriving via the legacy magic-link path. Kept around for back-compat.
const ERROR_MESSAGES = {
  invalid_link: 'リンクの有効期限が切れているか、無効です。コードでログインし直してください。',
  auth_failed: '認証に失敗しました。もう一度お試しください。',
}

function Login() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const [step, setStep] = useState('email') // 'email' | 'code'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | verifying | error
  const [errorMsg, setErrorMsg] = useState('')

  // Surface ?error= from AuthCallback (magic-link fallback path).
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

  const clearIncomingError = () => {
    if (!incomingErrorKey) return
    const next = new URLSearchParams(params)
    next.delete('error')
    setParams(next, { replace: true })
  }

  const requestCode = async (emailToSend) => {
    const trimmed = (emailToSend ?? email).trim()
    if (!trimmed) return false
    setStatus('sending'); setErrorMsg('')
    clearIncomingError()
    try {
      // No emailRedirectTo: we want the OTP code path, not a magic link.
      // shouldCreateUser:false so /login can't accidentally provision an
      // account — registration goes through /register.
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { shouldCreateUser: false },
      })
      if (error) throw error
      setStatus('idle')
      return true
    } catch (err) {
      setErrorMsg(err?.message || 'ログインコードの送信に失敗しました')
      setStatus('error')
      return false
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    const ok = await requestCode()
    if (ok) {
      setCode('')
      setStep('code')
    }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    const trimmedCode = code.trim()
    if (trimmedCode.length !== 6) return
    setStatus('verifying'); setErrorMsg('')
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: trimmedCode,
        type: 'email',
      })
      if (error) throw error
      if (!data.session) {
        // Belt-and-braces: verifyOtp success without a session shouldn't
        // happen for type:'email', but guard anyway.
        throw new Error('セッションを開始できませんでした')
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      // Supabase returns generic "Invalid login credentials" / "Token has
      // expired or is invalid" messages — surface a friendlier one.
      const raw = String(err?.message || '')
      const friendly = /invalid|expired|otp|token/i.test(raw)
        ? 'コードが間違っているか、期限切れです。もう一度お試しください。'
        : raw || '認証に失敗しました。'
      setErrorMsg(friendly)
      setStatus('error')
    }
  }

  // Re-send the code (called from "コードが届かない方はこちら" link). Per
  // spec: also bring the user back to step 1 so they can fix a typo'd
  // address while they're at it.
  const handleResend = async () => {
    setStep('email')
    setStatus('idle')
    setErrorMsg('')
    setCode('')
  }

  // Quick "back to email step" without re-sending.
  const handleBackToEmail = () => {
    setStep('email')
    setStatus('idle')
    setErrorMsg('')
    setCode('')
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
          {step === 'email' ? (
            <>
              <h1 style={s.title}>おかえりなさい</h1>
              <p style={s.sub}>
                ご登録のメールアドレスに<br />
                ログインコードをお送りします。
              </p>

              {(status === 'error' && errorMsg) && <div style={s.error}>{errorMsg}</div>}
              {status !== 'error' && incomingError && <div style={s.error}>{incomingError}</div>}

              <form onSubmit={handleEmailSubmit}>
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
                  {status === 'sending' ? '送信中...' : 'ログインコードを送る'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 style={s.title}>コードを入力</h1>
              <p style={s.sub}>
                メールに届いた<br />
                <strong>6桁のコード</strong>を入力してください。
              </p>

              <div style={s.emailNotice}>
                <strong>{email}</strong> に送信しました
              </div>

              {(status === 'error' && errorMsg) && <div style={s.error}>{errorMsg}</div>}

              <form onSubmit={handleCodeSubmit}>
                <div style={s.field}>
                  <label style={s.label}>ログインコード</label>
                  <input
                    style={s.codeInput}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    placeholder="------"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    autoFocus
                    required
                  />
                </div>
                <button
                  type="submit"
                  style={{ ...s.btn, ...(status === 'verifying' || code.length !== 6 ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
                  disabled={status === 'verifying' || code.length !== 6}
                >
                  {status === 'verifying' ? '確認中...' : 'ログインする'}
                </button>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  style={s.btnSecondary}
                  disabled={status === 'verifying'}
                >
                  ← メールアドレスを変更する
                </button>
              </form>

              <div style={s.resendRow}>
                <button type="button" onClick={handleResend} style={s.resendLink} disabled={status === 'verifying'}>
                  コードが届かない方はこちら（再送信）
                </button>
              </div>
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
