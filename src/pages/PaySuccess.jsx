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
    background: '#EAF2EB', color: '#7A9E7E',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36, fontWeight: 900,
    margin: '0 auto 24px',
  },
  title: { fontSize: 22, fontWeight: 900, marginBottom: 12 },
  desc: { color: '#5C4A32', fontSize: 15, lineHeight: 1.7, marginBottom: 28 },
  hint: { color: '#8B7355', fontSize: 12, lineHeight: 1.7 },
}

function PaySuccess() {
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>✓</div>
        <h1 style={s.title}>お支払いが完了しました</h1>
        <p style={s.desc}>ありがとうございました</p>
        <p style={s.hint}>このタブは閉じていただいて<br />大丈夫です</p>
      </div>
    </div>
  )
}

export default PaySuccess
