import { Link, useSearchParams } from 'react-router-dom'

const s = {
  page: { minHeight: '100vh', background: '#FAF6F1', fontFamily: "'Zen Maru Gothic', sans-serif", color: '#2C2418' },
  header: { background: '#fff', borderBottom: '1px solid #E8DDD0', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: 36, height: 36, borderRadius: 10, background: '#2C2418', color: '#FAF6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 },
  logoText: { fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: '#2C2418' },
  logoAccent: { color: '#C4745A' },
  main: { maxWidth: 520, margin: '60px auto', padding: '0 24px 60px' },
  card: { background: '#fff', borderRadius: 24, padding: '48px 32px', boxShadow: '0 8px 30px rgba(92,74,50,.08)', textAlign: 'center' },
  iconOk: { width: 72, height: 72, borderRadius: '50%', background: '#EAF2EB', color: '#7A9E7E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, margin: '0 auto 20px' },
  iconWarn: { width: 72, height: 72, borderRadius: '50%', background: '#F3EAE0', color: '#C4745A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 900, margin: '0 auto 20px' },
  title: { fontSize: 22, fontWeight: 900, marginBottom: 12 },
  desc: { color: '#5C4A32', fontSize: 14, lineHeight: 1.8, marginBottom: 28 },
  btn: { display: 'inline-block', padding: '14px 36px', borderRadius: 12, background: '#2C2418', color: '#FAF6F1', fontFamily: "'Zen Maru Gothic', sans-serif", fontWeight: 700, fontSize: 15, textDecoration: 'none', minWidth: 220 },
  sub: { marginTop: 18, fontSize: 12, color: '#8B7355' },
  hint: { fontSize: 12, color: '#8B7355', lineHeight: 1.7, marginTop: 18 },
}

function RegisterComplete() {
  const [searchParams] = useSearchParams()
  const salonId = (searchParams.get('salonId') || '').trim()
  const salonName = (searchParams.get('salonName') || '').trim()

  const dashboardHref = (() => {
    const params = new URLSearchParams()
    if (salonId) params.set('salonId', salonId)
    if (salonName) params.set('salonName', salonName)
    const qs = params.toString()
    return qs ? `/dashboard?${qs}` : '/dashboard'
  })()

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
          {salonId ? (
            <>
              <div style={s.iconOk}>✓</div>
              <h1 style={s.title}>お会計の準備ができました</h1>
              <p style={s.desc}>
                {salonName ? `${salonName} の` : ''}サロン専用ダッシュボードを<br />
                ご用意しました。<br />
                さっそく、最初のお会計リンクを発行してみましょう。
              </p>
              <Link to={dashboardHref} style={s.btn}>ダッシュボードへ進む</Link>
              <div style={s.sub}>ご登録いただきありがとうございます</div>
            </>
          ) : (
            <>
              <div style={s.iconWarn}>!</div>
              <h1 style={s.title}>サロン情報が見つかりません</h1>
              <p style={s.desc}>
                URLからサロン情報を読み取れませんでした。<br />
                ご登録時にお送りしたメールに記載の<br />
                ダッシュボードリンクからお進みください。
              </p>
              <p style={s.hint}>
                メールが届いていない場合は、<br />
                info@momupay.com までご連絡ください。
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default RegisterComplete
