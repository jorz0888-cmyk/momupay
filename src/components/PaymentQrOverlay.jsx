import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

/* Color tokens (matches MomuPay design system) */
const C = {
  cream: '#FAF6F1', sand: '#E8DDD0', mocha: '#8B7355', bark: '#5C4A32',
  espresso: '#2C2418', terra: '#C4745A', sage: '#7A9E7E', white: '#fff',
}
const font = "'Zen Maru Gothic', sans-serif"
const fontEn = "'DM Sans', sans-serif"

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    background: C.cream, color: C.espresso, fontFamily: font,
    display: 'flex', flexDirection: 'column',
    overflowY: 'auto',
  },
  header: {
    flexShrink: 0,
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '18px 24px',
    borderBottom: `1px solid ${C.sand}`,
    background: C.white,
  },
  logoMark: {
    width: 32, height: 32, borderRadius: 8,
    background: C.espresso, color: C.cream,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600,
  },
  logoText: { fontFamily: fontEn, fontWeight: 700, fontSize: 18, color: C.espresso },
  body: {
    flex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    gap: 18,
    textAlign: 'center',
  },
  label: { fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: C.mocha, textTransform: 'uppercase' },
  amount: { fontFamily: fontEn, fontSize: 44, fontWeight: 900, color: C.espresso, lineHeight: 1.1 },
  memo: { fontSize: 14, color: C.bark, maxWidth: 320, wordBreak: 'break-word' },
  qrWrap: {
    background: C.white,
    padding: 20,
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(92,74,50,.08)',
    display: 'inline-flex',
    margin: '8px 0',
  },
  hint: { fontSize: 13, color: C.mocha },
  footer: {
    flexShrink: 0,
    borderTop: `1px solid ${C.sand}`,
    background: C.white,
    padding: '16px 20px 20px',
    display: 'flex', flexDirection: 'column', gap: 10,
    alignItems: 'stretch',
    maxWidth: 440, margin: '0 auto', width: '100%', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '13px 20px',
    fontFamily: font, fontWeight: 700, fontSize: 14,
    border: 'none', borderRadius: 12, cursor: 'pointer',
    display: 'block',
  },
  copyBtn: { background: C.terra, color: C.cream },
  closeBtn: { background: 'transparent', color: C.mocha, border: `1.5px solid ${C.sand}` },
  copied: { fontSize: 12, color: C.sage, fontWeight: 700, textAlign: 'center' },
}

function PaymentQrOverlay({ url, amount, memo, onClose }) {
  const [copied, setCopied] = useState(false)

  /* ESC key closes the overlay */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  /* Prevent body scroll while mounted */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const copy = async () => {
    try { await navigator.clipboard.writeText(url) }
    catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta); ta.select(); document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* Responsive QR size: 260px default, shrink on narrow viewports */
  const qrSize = Math.min(260, typeof window !== 'undefined' ? Math.max(180, window.innerWidth - 120) : 260)

  return (
    <div style={s.overlay} role="dialog" aria-modal="true" aria-label="決済QRコード">
      <div style={s.header}>
        <div style={s.logoMark}>M</div>
        <span style={s.logoText}>Momu<span style={{ color: C.terra }}>Pay</span></span>
      </div>

      <div style={s.body}>
        <div style={s.label}>お支払い</div>
        <div style={s.amount}>¥{Number(amount || 0).toLocaleString()}</div>
        {memo && <div style={s.memo}>{memo}</div>}
        <div style={s.qrWrap}>
          <QRCodeSVG value={url} size={qrSize} level="M" marginSize={0} />
        </div>
        <div style={s.hint}>スマホで読み取ってください</div>
      </div>

      <div style={s.footer}>
        <button style={{ ...s.btn, ...s.copyBtn }} onClick={copy}>
          {copied ? 'コピーしました' : 'URLをコピー'}
        </button>
        <button style={{ ...s.btn, ...s.closeBtn }} onClick={onClose}>閉じる</button>
      </div>
    </div>
  )
}

export default PaymentQrOverlay
