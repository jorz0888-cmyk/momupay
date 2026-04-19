import { useState } from 'react'
import { Link } from 'react-router-dom'

const s = {
  page: { minHeight: '100vh', background: '#FAF6F1', fontFamily: "'Zen Maru Gothic', sans-serif", color: '#2C2418' },
  header: { background: '#fff', borderBottom: '1px solid #E8DDD0', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: 36, height: 36, borderRadius: 10, background: '#2C2418', color: '#FAF6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 },
  logoText: { fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: '#2C2418' },
  logoAccent: { color: '#C4745A' },
  main: { maxWidth: 560, margin: '40px auto', padding: '0 24px 60px' },
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
  successHead: { textAlign: 'center', marginBottom: 28 },
  successIcon: { fontSize: 44, marginBottom: 10 },
  successTitle: { fontSize: 22, fontWeight: 900, marginBottom: 8 },
  successLead: { color: '#8B7355', fontSize: 14, lineHeight: 1.7 },
  guideCard: {
    background: '#FAF6F1',
    border: '1px solid #E8DDD0',
    borderRadius: 14,
    padding: '20px 20px',
    marginBottom: 14,
  },
  guideNum: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: '50%',
    background: '#C4745A', color: '#FAF6F1',
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
    marginRight: 10, flexShrink: 0,
  },
  guideHead: { display: 'flex', alignItems: 'center', marginBottom: 10 },
  guideTitle: { fontSize: 15, fontWeight: 900 },
  guideBody: { fontSize: 13, color: '#5C4A32', lineHeight: 1.8 },
  miniLabel: { fontSize: 11, fontWeight: 700, color: '#8B7355', marginTop: 10, marginBottom: 4, letterSpacing: '0.04em' },
  pickRow: {
    background: '#fff',
    border: '1px solid #E8DDD0',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 13,
    marginBottom: 6,
  },
  arrow: { color: '#C4745A', fontWeight: 700 },
  urlRow: {
    display: 'flex', gap: 8, alignItems: 'center',
    background: '#fff', border: '1px solid #E8DDD0', borderRadius: 10,
    padding: '10px 12px', marginTop: 6,
  },
  urlText: { flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#2C2418', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  copyBtn: {
    flexShrink: 0, background: '#C4745A', color: '#FAF6F1',
    border: 'none', borderRadius: 8, padding: '7px 14px',
    fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer',
  },
  copied: { fontSize: 11, color: '#7A9E7E', marginTop: 6, fontWeight: 700 },
  note: { fontSize: 12, color: '#8B7355', marginTop: 8, lineHeight: 1.7 },
  bullet: { margin: '4px 0 0 1.1em', padding: 0 },
  mailNote: { textAlign: 'center', fontSize: 12, color: '#8B7355', marginTop: 18, lineHeight: 1.8 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: '#8B7355' },
  link: { color: '#C4745A', fontWeight: 700 },
}

const MOMUPAY_URL = 'https://www.momupay.com'

function Register() {
  const [form, setForm] = useState({
    salonName: '', ownerName: '', email: '', phone: '',
    businessType: '', address: '', agreeTerms: false,
  })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [onboardingUrl, setOnboardingUrl] = useState('')
  const [urlCopied, setUrlCopied] = useState(false)

  const onChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [field]: val }))
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(MOMUPAY_URL)
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = MOMUPAY_URL
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    }
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
      const data = await res.json().catch(() => ({}))
      if (data.onboardingUrl) setOnboardingUrl(data.onboardingUrl)
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message || '送信中にエラーが発生しました。')
      setStatus('error')
    }
  }

  const goOnboarding = () => {
    if (onboardingUrl) window.location.href = onboardingUrl
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
            <>
              <div style={s.successHead}>
                <div style={s.successIcon}>✓</div>
                <h2 style={s.successTitle}>ご登録ありがとうございます</h2>
                <p style={s.successLead}>
                  Stripeの設定に進む前に、<br />
                  以下4つのポイントをご確認ください。
                </p>
              </div>

              {/* Card 1 */}
              <div style={s.guideCard}>
                <div style={s.guideHead}>
                  <span style={s.guideNum}>1</span>
                  <span style={s.guideTitle}>業種の選択</span>
                </div>
                <div style={s.guideBody}>
                  Stripeの設定画面で業種を選ぶ際は、下記を目安にしてください。
                  <div style={s.miniLabel}>リラクゼーション／整体／アロマ</div>
                  <div style={s.pickRow}>
                    ヘルスケア <span style={s.arrow}>→</span> マッサージ店
                  </div>
                  <div style={s.miniLabel}>エステ／ネイル</div>
                  <div style={s.pickRow}>
                    美容 <span style={s.arrow}>→</span> エステティックサロン
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div style={s.guideCard}>
                <div style={s.guideHead}>
                  <span style={s.guideNum}>2</span>
                  <span style={s.guideTitle}>ウェブサイトURL</span>
                </div>
                <div style={s.guideBody}>
                  ウェブサイトURLの入力欄には、下記URLをそのまま貼り付けてください。
                  <div style={s.urlRow}>
                    <span style={s.urlText}>{MOMUPAY_URL}</span>
                    <button style={s.copyBtn} onClick={copyUrl}>
                      {urlCopied ? 'コピー済' : 'コピー'}
                    </button>
                  </div>
                  {urlCopied && <div style={s.copied}>コピーしました</div>}
                  <div style={s.note}>
                    ※ ご自身のHPをお持ちの方もこのURLで統一してください。
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div style={s.guideCard}>
                <div style={s.guideHead}>
                  <span style={s.guideNum}>3</span>
                  <span style={s.guideTitle}>本人確認書類</span>
                </div>
                <div style={s.guideBody}>
                  以下のいずれかをご用意ください。
                  <ul style={s.bullet}>
                    <li>運転免許証（表・裏の両面）</li>
                    <li>マイナンバーカード（表面のみ）</li>
                  </ul>
                </div>
              </div>

              {/* Card 4 */}
              <div style={s.guideCard}>
                <div style={s.guideHead}>
                  <span style={s.guideNum}>4</span>
                  <span style={s.guideTitle}>銀行口座情報</span>
                </div>
                <div style={s.guideBody}>
                  売上金の振込先を登録します。以下をご用意ください。
                  <ul style={s.bullet}>
                    <li>銀行名</li>
                    <li>支店名</li>
                    <li>口座種別（普通／当座）</li>
                    <li>口座番号</li>
                    <li>口座名義（カナ）</li>
                  </ul>
                </div>
              </div>

              <button
                style={{ ...s.btn, marginTop: 20, ...(!onboardingUrl ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
                onClick={goOnboarding}
                disabled={!onboardingUrl}
              >
                上記を確認しました — Stripe設定へ進む
              </button>

              <div style={s.mailNote}>
                このリンクはメールでもお送りしています。<br />
                あとから設定する場合はメールをご確認ください。
              </div>
            </>
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
