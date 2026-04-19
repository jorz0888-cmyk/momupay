import { Link } from 'react-router-dom'

const s = {
  page: { minHeight: '100vh', background: '#FAF6F1', fontFamily: "'Zen Maru Gothic', sans-serif", color: '#2C2418' },
  header: { background: '#fff', borderBottom: '1px solid #E8DDD0', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: 36, height: 36, borderRadius: 10, background: '#2C2418', color: '#FAF6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 },
  logoText: { fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: '#2C2418' },
  logoAccent: { color: '#C4745A' },
  main: { maxWidth: 520, margin: '60px auto', padding: '0 24px 60px' },
  card: { background: '#fff', borderRadius: 24, padding: '48px 32px', boxShadow: '0 8px 30px rgba(92,74,50,.08)', textAlign: 'center' },
  icon: { width: 72, height: 72, borderRadius: '50%', background: '#F3EAE0', color: '#C4745A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, margin: '0 auto 20px' },
  title: { fontSize: 22, fontWeight: 900, marginBottom: 12 },
  desc: { color: '#8B7355', fontSize: 14, lineHeight: 1.8, marginBottom: 28 },
  link: { display: 'inline-block', color: '#C4745A', fontWeight: 700, fontSize: 14, textDecoration: 'none' },
}

function PayCancel() {
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
          <div style={s.icon}>!</div>
          <h1 style={s.title}>お支払いがキャンセルされました</h1>
          <p style={s.desc}>
            もう一度お試しいただくか、<br />
            サロンにお問い合わせください。
          </p>
          <Link to="/" style={s.link}>MomuPayトップへ戻る →</Link>
        </div>
      </main>
    </div>
  )
}

export default PayCancel
