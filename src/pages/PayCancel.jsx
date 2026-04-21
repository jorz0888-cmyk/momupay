const s = {
  page: {
    minHeight: '100vh',
    background: '#FAF6F1',
    fontFamily: "'Zen Maru Gothic', sans-serif",
    color: '#2C2418',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: '56px 32px',
    boxShadow: '0 8px 30px rgba(92,74,50,.08)',
    textAlign: 'center',
    width: '100%',
    maxWidth: 440,
  },
  icon: {
    width: 72, height: 72, borderRadius: '50%',
    background: '#F3EAE0', color: '#C4745A',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36, fontWeight: 900,
    margin: '0 auto 24px',
  },
  title: { fontSize: 22, fontWeight: 900, marginBottom: 12 },
  desc: { color: '#5C4A32', fontSize: 15, lineHeight: 1.7 },
}

function PayCancel() {
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>!</div>
        <h1 style={s.title}>お支払いがキャンセルされました</h1>
        <p style={s.desc}>お手数ですが、<br />サロンにお声がけください</p>
      </div>
    </div>
  )
}

export default PayCancel
