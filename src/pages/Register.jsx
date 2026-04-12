import { useState } from 'react'
import { Link } from 'react-router-dom'

const s = {
  page: { minHeight: '100vh', background: '#FAF6F1', fontFamily: "'Zen Maru Gothic', sans-serif", color: '#2C2418' },
  header: { background: '#fff', borderBottom: '1px solid #E8DDD0', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: 36, height: 36, borderRadius: 10, background: '#2C2418', color: '#FAF6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 },
  logoText: { fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: '#2C2418' },
  logoAccent: { color: '#C4745A' },
  main: { maxWidth: 520, margin: '40px auto', padding: '0 24px 60px' },
  card: { background: '#fff', borderRadius: 24, padding: '36px 32px', boxShadow: '0 8px 30px rgba(92,74,50,.08)' },
  title: { fontSize: 24, fontWeight: 900, marginBottom: 6 },
  sub: { fontSize: 14, color: '#8B7355', marginBottom: 28, lineHeight: 1.7 },
  label: { display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#2C2418' },
  req: { color: '#C4745A', fontSize: 12 },
  field: { marginBottom: 20 },
  input: { width: '100%', padding: '12px 16px', border: '1.5px solid #E8DDD0', borderRadius: 10, fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: 15, background: '#fff', color: '#2C2418', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px 16px', border: '1.5px solid #E8DDD0', borderRadius: 10, fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: 15, background: '#fff', color: '#2C2418', outline: 'none', appearance: 'none', boxSizing: 'border-box', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B7355' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' },
  checkRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, fontSize: 14 },
  checkbox: { width: 18, height: 18, accentColor: '#C4745A', cursor: 'pointer', flexShrink: 0 },
  btn: { width: '100%', padding: '15px 36px', border: 'none', borderRadius: 12, background: '#2C2418', color: '#FAF6F1', fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'block', position: 'relative', zIndex: 1 },
  error: { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 },
  success: { textAlign: 'center', padding: '60px 20px' },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: 900, marginBottom: 12 },
  successDesc: { color: '#8B7355', fontSize: 14, lineHeight: 1.8 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#8B7355' },
  link: { color: '#C4745A', fontWeight: 700 },
}

function Register() {
  const [form, setForm] = useState({
    salonName: '', ownerName: '', email: '', phone: '',
    businessType: '', address: '', website: '', agreeTerms: false,
  })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const onChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [field]: val }))
  }

  const handleSubmit = async () => {
    const required = [
      ['salonName', 'サロン名'], ['ownerName', '代表者名'],
      ['email', 'メールアドレス'], ['businessType', '業態'],
    ]
    for (const [key, label] of required) {
      if (!form[key].trim()) {
        setErrorMsg(`${label}を入力してください。`)
        setStatus('error')
        return
      }
    }
    if (!form.agreeTerms) {
      setErrorMsg('利用規約への同意が必要です。')
      setStatus('error')
      return
    }
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('https://n8n.kikitte.com/webhook/momupay-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('送信に失敗しました。')
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message || '送信中にエラーが発生しました。')
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
          {status === 'success' ? (
            <div style={s.success}>
              <div style={s.successIcon}>✓</div>
              <h2 style={s.successTitle}>ご登録ありがとうございます</h2>
              <p style={s.successDesc}>Stripeアカウントの設定リンクを<br />メールでお送りします。</p>
            </div>
          ) : (
            <>
              <h1 style={s.title}>無料でサロン登録</h1>
              <p style={s.sub}>初期費用・月額費用なし。登録後すぐにオンライン決済が使えます。</p>

              {status === 'error' && errorMsg && <div style={s.error}>{errorMsg}</div>}

              <div style={s.field}>
                <label style={s.label}>サロン名 <span style={s.req}>*</span></label>
                <input style={s.input} type="text" placeholder="例：リラクゼーションもむ" value={form.salonName} onChange={onChange('salonName')} />
              </div>
              <div style={s.field}>
                <label style={s.label}>代表者名 <span style={s.req}>*</span></label>
                <input style={s.input} type="text" placeholder="山田 太郎" value={form.ownerName} onChange={onChange('ownerName')} />
              </div>
              <div style={s.field}>
                <label style={s.label}>メールアドレス <span style={s.req}>*</span></label>
                <input style={s.input} type="email" placeholder="example@email.com" value={form.email} onChange={onChange('email')} />
              </div>
              <div style={s.field}>
                <label style={s.label}>電話番号</label>
                <input style={s.input} type="tel" placeholder="090-1234-5678" value={form.phone} onChange={onChange('phone')} />
              </div>
              <div style={s.field}>
                <label style={s.label}>業態 <span style={s.req}>*</span></label>
                <select style={s.select} value={form.businessType} onChange={onChange('businessType')}>
                  <option value="" disabled>選択してください</option>
                  <option value="リラクゼーション">リラクゼーション</option>
                  <option value="整体・骨盤矯正">整体・骨盤矯正</option>
                  <option value="エステ">エステ</option>
                  <option value="アロマ">アロマ</option>
                  <option value="ネイル">ネイル</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>店舗住所</label>
                <input style={s.input} type="text" placeholder="未定の場合は空欄でOK" value={form.address} onChange={onChange('address')} />
              </div>
              <div style={s.field}>
                <label style={s.label}>ホームページURL</label>
                <input style={s.input} type="url" placeholder="https://example.com" value={form.website} onChange={onChange('website')} />
              </div>
              <div style={s.checkRow}>
                <input type="checkbox" style={s.checkbox} checked={form.agreeTerms} onChange={onChange('agreeTerms')} id="terms" />
                <label htmlFor="terms"><Link to="/#legal" style={s.link}>利用規約</Link>に同意する</label>
              </div>
              <button
                style={{ ...s.btn, ...(status === 'sending' ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
                onClick={handleSubmit}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? '送信中...' : '無料で登録する'}
              </button>
            </>
          )}
        </div>
        <div style={s.footer}>
          すでにアカウントをお持ちの方は<Link to="/pay" style={s.link}>こちら</Link>
        </div>
      </main>
    </div>
  )
}

export default Register
