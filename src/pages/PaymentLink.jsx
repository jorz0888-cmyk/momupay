import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PaymentQrOverlay from '../components/PaymentQrOverlay.jsx'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FAF6F1',
    fontFamily: "'Zen Maru Gothic', sans-serif",
    color: '#2C2418',
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #E8DDD0',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#2C2418',
    color: '#FAF6F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20,
    fontWeight: 600,
  },
  logoText: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: 20,
    color: '#2C2418',
  },
  logoAccent: {
    color: '#C4745A',
  },
  main: {
    maxWidth: 480,
    margin: '40px auto',
    padding: '0 24px',
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: '36px 32px',
    boxShadow: '0 8px 30px rgba(92,74,50,.08)',
  },
  title: {
    fontSize: 22,
    fontWeight: 900,
    marginBottom: 4,
  },
  salonName: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 28,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 6,
    color: '#2C2418',
  },
  req: {
    color: '#C4745A',
    fontSize: 12,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  amountWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  yen: {
    fontSize: 20,
    fontWeight: 700,
    color: '#5C4A32',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #E8DDD0',
    borderRadius: 10,
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontSize: 15,
    background: '#fff',
    color: '#2C2418',
    outline: 'none',
    transition: 'border-color .2s',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #E8DDD0',
    borderRadius: 10,
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontSize: 15,
    background: '#fff',
    color: '#2C2418',
    outline: 'none',
    resize: 'vertical',
    minHeight: 80,
    transition: 'border-color .2s',
  },
  btn: {
    width: '100%',
    padding: '15px 36px',
    border: 'none',
    borderRadius: 12,
    background: '#2C2418',
    color: '#FAF6F1',
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    transition: 'background .3s',
    display: 'block',
    position: 'relative',
    zIndex: 1,
    marginTop: 8,
  },
  resultBox: {
    marginTop: 24,
    background: '#EAF2EB',
    borderRadius: 12,
    padding: '20px',
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#7A9E7E',
    marginBottom: 8,
  },
  linkRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  linkInput: {
    flex: 1,
    padding: '10px 14px',
    border: '1.5px solid #E8DDD0',
    borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    background: '#fff',
    color: '#2C2418',
    outline: 'none',
  },
  copyBtn: {
    flexShrink: 0,
    padding: '10px 18px',
    border: 'none',
    borderRadius: 10,
    background: '#C4745A',
    color: '#FAF6F1',
    fontFamily: "'Zen Maru Gothic', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'background .3s',
  },
  copied: {
    fontSize: 12,
    color: '#7A9E7E',
    marginTop: 8,
    fontWeight: 700,
  },
}

function PaymentLink() {
  const [searchParams] = useSearchParams()
  const salonId = searchParams.get('salonId') || ''
  const salonName = searchParams.get('salonName') || 'MomuPay加盟店'

  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState('idle') // idle | sending | error
  const [errorMsg, setErrorMsg] = useState('')
  const [issuedAmount, setIssuedAmount] = useState(0)
  const [issuedMemo, setIssuedMemo] = useState('')
  const [showQrFullscreen, setShowQrFullscreen] = useState(false)

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '')
    setAmount(val)
  }

  const handleGenerate = async () => {
    if (!amount || Number(amount) <= 0) return
    setStatus('sending')
    setErrorMsg('')
    setGeneratedLink('')
    try {
      const res = await fetch('https://n8n.kikitte.com/webhook/momupay-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          memo,
          salonId,
          salonName,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (!data.url) throw new Error()
      setGeneratedLink(data.url)
      setIssuedAmount(Number(amount))
      setIssuedMemo(memo)
      setCopied(false)
      setStatus('idle')
      setShowQrFullscreen(true)
    } catch {
      setErrorMsg('リンクの発行に失敗しました')
      setStatus('error')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.querySelector('#link-url')
      input?.select()
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logoMark}>M</div>
        <span style={styles.logoText}>
          Momu<span style={styles.logoAccent}>Pay</span>
        </span>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h1 style={styles.title}>決済リンク発行</h1>
          <p style={styles.salonName}>{salonName}</p>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              金額 <span style={styles.req}>*</span>
            </label>
            <div style={styles.amountWrap}>
              <span style={styles.yen}>¥</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="5,000"
                value={amount ? Number(amount).toLocaleString() : ''}
                onChange={handleAmountChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>メモ（任意）</label>
            <textarea
              placeholder="全身もみほぐし60分"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              style={styles.textarea}
            />
          </div>

          <button
            style={{
              ...styles.btn,
              ...((!amount || Number(amount) <= 0 || status === 'sending') ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
            }}
            onClick={handleGenerate}
            disabled={!amount || Number(amount) <= 0 || status === 'sending'}
          >
            {status === 'sending' ? '発行中...' : '決済リンクを発行する'}
          </button>

          {status === 'error' && errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginTop: 16, color: '#dc2626', fontSize: 14 }}>
              {errorMsg}
            </div>
          )}

          {generatedLink && (
            <div style={styles.resultBox}>
              <div style={styles.resultLabel}>決済リンクが発行されました</div>
              <div style={styles.linkRow}>
                <input
                  id="link-url"
                  type="text"
                  readOnly
                  value={generatedLink}
                  style={styles.linkInput}
                />
                <button style={styles.copyBtn} onClick={handleCopy}>
                  コピー
                </button>
              </div>
              {copied && <div style={styles.copied}>コピーしました</div>}
              <button
                style={{
                  marginTop: 12, width: '100%', padding: '12px 18px',
                  border: 'none', borderRadius: 10,
                  background: '#2C2418', color: '#FAF6F1',
                  fontFamily: "'Zen Maru Gothic', sans-serif",
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
                onClick={() => setShowQrFullscreen(true)}
              >
                QRを再表示
              </button>
            </div>
          )}
        </div>
      </main>
      {showQrFullscreen && generatedLink && (
        <PaymentQrOverlay
          url={generatedLink}
          amount={issuedAmount}
          memo={issuedMemo}
          onClose={() => setShowQrFullscreen(false)}
        />
      )}
    </div>
  )
}

export default PaymentLink
