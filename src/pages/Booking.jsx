import { useState } from 'react'
import { useParams } from 'react-router-dom'

/* ── tokens ── */
const C = {
  cream: '#FAF6F1', sand: '#E8DDD0', mocha: '#8B7355', bark: '#5C4A32',
  espresso: '#2C2418', sage: '#7A9E7E', sageL: '#EAF2EB', terra: '#C4745A',
  gold: '#D4A853', white: '#fff',
}
const font = "'Zen Maru Gothic', sans-serif"
const fontEn = "'DM Sans', sans-serif"

const MENUS = [
  { id: 1, name: '全身もみほぐし 60分', duration: 60, price: 6000 },
  { id: 2, name: 'アロマオイル 90分', duration: 90, price: 9000 },
  { id: 3, name: 'ヘッドスパ 30分', duration: 30, price: 3500 },
  { id: 4, name: 'フットケア 45分', duration: 45, price: 5000 },
]

const HOURS = Array.from({ length: 10 }, (_, i) => `${10 + i}:00`)

function buildDates() {
  const d = []; const now = new Date()
  for (let i = 0; i < 14; i++) {
    const dt = new Date(now); dt.setDate(now.getDate() + i)
    d.push(dt)
  }
  return d
}
const WEEKDAY = ['日', '月', '火', '水', '木', '金', '土']
const fmtDate = (d) => `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAY[d.getDay()]})`
const fmtDateFull = (d) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAY[d.getDay()]})`

/* ── shared styles ── */
const page = { minHeight: '100vh', background: C.cream, fontFamily: font, color: C.espresso }
const header = { background: C.white, borderBottom: `1px solid ${C.sand}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10 }
const logoMark = { width: 32, height: 32, borderRadius: 8, background: C.espresso, color: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600 }
const main = { maxWidth: 520, margin: '0 auto', padding: '24px 20px 60px' }
const card = { background: C.white, borderRadius: 20, padding: '28px 24px', boxShadow: '0 4px 20px rgba(92,74,50,.06)' }
const btnPrimary = { width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: C.espresso, color: C.cream, fontFamily: font, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'block', position: 'relative', zIndex: 1 }
const btnSecondary = { ...btnPrimary, background: 'transparent', color: C.mocha, border: `1.5px solid ${C.sand}` }
const btnDisabled = { opacity: 0.4, cursor: 'not-allowed' }
const errBox = { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 14 }

/* ══════════════════════════════════════════ */

function Booking() {
  const { salonId } = useParams()
  const salonName = salonId ? decodeURIComponent(salonId) : 'MomuPay加盟店'

  const [step, setStep] = useState(1)
  const [menuId, setMenuId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const dates = buildDates()
  const selectedMenu = MENUS.find(m => m.id === menuId)

  const next = () => setStep(s => s + 1)
  const back = () => { setStep(s => s - 1); setError('') }

  const handleSubmit = async () => {
    setStatus('sending'); setError('')
    try {
      const res = await fetch('https://n8n.kikitte.com/webhook/momupay-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId, salonName,
          menu: selectedMenu.name, duration: selectedMenu.duration, amount: selectedMenu.price,
          date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
          time: selectedTime, customerName: name, email, phone,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      throw new Error()
    } catch {
      setError('予約の処理に失敗しました。もう一度お試しください。')
      setStatus('error')
    }
  }

  return (
    <div style={page}>
      {/* Header */}
      <div style={header}>
        <div style={logoMark}>M</div>
        <span style={{ fontFamily: fontEn, fontWeight: 700, fontSize: 17 }}>Momu<span style={{ color: C.terra }}>Pay</span></span>
      </div>

      <div style={main}>
        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
          {['メニュー', '日時', 'お客様情報', '確認・決済'].map((l, i) => {
            const num = i + 1; const active = num === step; const done = num < step
            return (
              <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, fontFamily: fontEn,
                    background: done ? C.sage : active ? C.terra : C.sand,
                    color: done || active ? C.white : C.mocha,
                  }}>{done ? '✓' : num}</div>
                  <span style={{ fontSize: 10, color: active ? C.terra : C.mocha, fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>{l}</span>
                </div>
                {num < 4 && <div style={{ width: 28, height: 2, background: done ? C.sage : C.sand, margin: '0 2px', marginBottom: 16 }} />}
              </div>
            )
          })}
        </div>

        {/* Step 1 – Menu */}
        {step === 1 && (
          <div style={card}>
            <div style={{ fontSize: 13, color: C.mocha, marginBottom: 4 }}>{salonName}</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>メニューを選択</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MENUS.map(m => {
                const sel = menuId === m.id
                return (
                  <div key={m.id} onClick={() => setMenuId(m.id)} style={{
                    border: `2px solid ${sel ? C.terra : C.sand}`, borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
                    background: sel ? 'rgba(196,116,90,.06)' : C.white, transition: 'all .15s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: C.mocha }}>{m.duration}分</div>
                      </div>
                      <div style={{ fontFamily: fontEn, fontWeight: 700, fontSize: 18, color: sel ? C.terra : C.bark }}>¥{m.price.toLocaleString()}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 24 }}>
              <button style={{ ...btnPrimary, ...(!menuId ? btnDisabled : {}) }} disabled={!menuId} onClick={next}>次へ</button>
            </div>
          </div>
        )}

        {/* Step 2 – Date/Time */}
        {step === 2 && (
          <div style={card}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>日時を選択</h2>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>日付</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
                {dates.map((d, i) => {
                  const sel = selectedDate && d.toDateString() === selectedDate.toDateString()
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <div key={i} onClick={() => setSelectedDate(d)} style={{
                      textAlign: 'center', padding: '10px 2px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${sel ? C.terra : 'transparent'}`,
                      background: sel ? 'rgba(196,116,90,.08)' : 'transparent', transition: 'all .15s',
                    }}>
                      <div style={{ fontSize: 10, color: isWeekend ? C.terra : C.mocha }}>{WEEKDAY[d.getDay()]}</div>
                      <div style={{ fontSize: 16, fontWeight: sel ? 700 : 500, fontFamily: fontEn, color: sel ? C.terra : C.espresso }}>{d.getDate()}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>時間帯</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                {HOURS.map(h => {
                  const sel = selectedTime === h
                  return (
                    <div key={h} onClick={() => setSelectedTime(h)} style={{
                      textAlign: 'center', padding: '10px 4px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontFamily: fontEn, fontWeight: sel ? 700 : 400,
                      border: `1.5px solid ${sel ? C.terra : C.sand}`,
                      background: sel ? 'rgba(196,116,90,.08)' : C.white, color: sel ? C.terra : C.espresso, transition: 'all .15s',
                    }}>{h}</div>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ ...btnSecondary, flex: 1 }} onClick={back}>戻る</button>
              <button style={{ ...btnPrimary, flex: 2, ...(!selectedDate || !selectedTime ? btnDisabled : {}) }}
                disabled={!selectedDate || !selectedTime} onClick={next}>次へ</button>
            </div>
          </div>
        )}

        {/* Step 3 – Customer info */}
        {step === 3 && (
          <div style={card}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>お客様情報</h2>
            {error && <div style={errBox}>{error}</div>}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>お名前 <span style={{ color: C.terra, fontSize: 12 }}>*</span></label>
              <input style={inputStyle} type="text" placeholder="山田 太郎" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>メールアドレス <span style={{ color: C.terra, fontSize: 12 }}>*</span></label>
              <input style={inputStyle} type="email" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>電話番号</label>
              <input style={inputStyle} type="tel" placeholder="090-1234-5678" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ ...btnSecondary, flex: 1 }} onClick={back}>戻る</button>
              <button style={{ ...btnPrimary, flex: 2, ...(!name.trim() || !email.trim() ? btnDisabled : {}) }}
                disabled={!name.trim() || !email.trim()}
                onClick={() => { setError(''); next() }}>次へ</button>
            </div>
          </div>
        )}

        {/* Step 4 – Confirm & Pay */}
        {step === 4 && (
          <div style={card}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>予約内容の確認</h2>
            {error && <div style={errBox}>{error}</div>}

            <div style={{ background: C.cream, borderRadius: 14, padding: 20, marginBottom: 24 }}>
              {[
                ['サロン', salonName],
                ['メニュー', selectedMenu?.name],
                ['日時', selectedDate ? `${fmtDateFull(selectedDate)} ${selectedTime}` : ''],
                ['お名前', name],
                ['メール', email],
                ...(phone ? [['電話番号', phone]] : []),
              ].map(([k, v], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 5 + (phone ? 1 : 0) - 1 ? `1px solid ${C.sand}` : 'none', fontSize: 14 }}>
                  <span style={{ color: C.mocha }}>{k}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', marginTop: 8, borderTop: `2px solid ${C.sand}` }}>
                <span style={{ fontWeight: 700 }}>お支払い金額</span>
                <span style={{ fontFamily: fontEn, fontWeight: 900, fontSize: 22, color: C.terra }}>¥{selectedMenu?.price.toLocaleString()}</span>
              </div>
            </div>

            <button
              style={{ ...btnPrimary, background: C.terra, fontSize: 14, ...(status === 'sending' ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
              disabled={status === 'sending'}
              onClick={handleSubmit}
            >
              {status === 'sending' ? '処理中...' : 'カードで事前決済して予約を確定する'}
            </button>

            <button style={{ ...btnSecondary, marginTop: 10 }} onClick={back} disabled={status === 'sending'}>戻る</button>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: C.mocha }}>
              決済はStripeの安全な環境で処理されます
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '12px 14px', border: `1.5px solid ${C.sand}`, borderRadius: 10,
  fontFamily: font, fontSize: 15, background: C.white, color: C.espresso, outline: 'none', boxSizing: 'border-box',
}

export default Booking
