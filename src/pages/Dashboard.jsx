import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/* ── color tokens ── */
const C = {
  cream: '#FAF6F1', warm: '#F3EAE0', sand: '#E8DDD0', mocha: '#8B7355',
  bark: '#5C4A32', espresso: '#2C2418', sage: '#7A9E7E', sageL: '#EAF2EB',
  terra: '#C4745A', gold: '#D4A853', white: '#fff',
}
const font = "'Zen Maru Gothic', sans-serif"
const fontEn = "'DM Sans', sans-serif"

/* ── mock data ── */
const MOCK_RESERVATIONS = [
  { id: 1, date: '2026-04-12 10:00', customer: '田中 花子', menu: '全身もみほぐし 60分', amount: 6000, status: '確定' },
  { id: 2, date: '2026-04-12 13:00', customer: '佐藤 太郎', menu: 'アロマオイル 90分', amount: 9000, status: '確定' },
  { id: 3, date: '2026-04-13 11:00', customer: '鈴木 美咲', menu: 'ヘッドスパ 30分', amount: 3500, status: '仮予約' },
  { id: 4, date: '2026-04-13 15:00', customer: '山田 健太', menu: '全身もみほぐし 90分', amount: 8500, status: '確定' },
  { id: 5, date: '2026-04-14 10:00', customer: '高橋 愛', menu: 'フットケア 45分', amount: 4500, status: 'キャンセル' },
]

const MOCK_CUSTOMERS = [
  { id: 1, name: '田中 花子', email: 'hanako@example.com', visits: 12, lastVisit: '2026-04-12' },
  { id: 2, name: '佐藤 太郎', email: 'taro@example.com', visits: 8, lastVisit: '2026-04-12' },
  { id: 3, name: '鈴木 美咲', email: 'misaki@example.com', visits: 5, lastVisit: '2026-04-06' },
  { id: 4, name: '山田 健太', email: 'kenta@example.com', visits: 3, lastVisit: '2026-04-01' },
  { id: 5, name: '高橋 愛', email: 'ai@example.com', visits: 15, lastVisit: '2026-04-10' },
]

const MOCK_DAILY_SALES = [
  { day: '4/1', amount: 18000 }, { day: '4/2', amount: 24000 }, { day: '4/3', amount: 12000 },
  { day: '4/4', amount: 31000 }, { day: '4/5', amount: 27000 }, { day: '4/6', amount: 9000 },
  { day: '4/7', amount: 0 }, { day: '4/8', amount: 22000 }, { day: '4/9', amount: 35000 },
  { day: '4/10', amount: 19000 }, { day: '4/11', amount: 28000 }, { day: '4/12', amount: 15000 },
]

const MOCK_MENUS = [
  { id: 1, name: '全身もみほぐし 60分', duration: 60, price: 6000 },
  { id: 2, name: '全身もみほぐし 90分', duration: 90, price: 8500 },
  { id: 3, name: 'アロマオイル 90分', duration: 90, price: 9000 },
  { id: 4, name: 'ヘッドスパ 30分', duration: 30, price: 3500 },
  { id: 5, name: 'フットケア 45分', duration: 45, price: 4500 },
]

const TABS = [
  { key: 'home', label: 'ダッシュボード', icon: '📊' },
  { key: 'pay', label: '決済リンク発行', icon: '🔗' },
  { key: 'reservations', label: '予約一覧', icon: '📅' },
  { key: 'customers', label: '顧客管理', icon: '👥' },
  { key: 'sales', label: '売上管理', icon: '💰' },
  { key: 'menus', label: 'メニュー管理', icon: '📋' },
  { key: 'settings', label: '設定', icon: '⚙️' },
]

/* ══════════════════════════════════════════
   Sub-views
   ══════════════════════════════════════════ */

/* ── Home ── */
function HomeTab() {
  const cards = [
    { label: '今月の売上', value: '¥240,000', sub: '前月比 +12%', color: C.terra },
    { label: '決済件数', value: '38件', sub: '前月比 +5件', color: C.sage },
    { label: '新規顧客数', value: '7人', sub: '前月比 +2人', color: C.gold },
  ]
  return (
    <>
      <h2 style={h2}>ダッシュボード</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 12px rgba(92,74,50,.06)' }}>
            <div style={{ fontSize: 13, color: C.mocha, marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: fontEn, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 12, color: C.sage, marginTop: 6 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.white, borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(92,74,50,.06)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>直近の予約</h3>
        <Table
          cols={['日時', '顧客名', 'メニュー', '金額', 'ステータス']}
          rows={MOCK_RESERVATIONS.slice(0, 3).map(r => [r.date, r.customer, r.menu, `¥${r.amount.toLocaleString()}`, <Badge key={r.id} s={r.status} />])}
        />
      </div>
    </>
  )
}

/* ── Pay ── */
function PayTab({ salonId, salonName }) {
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [link, setLink] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    if (!amount || Number(amount) <= 0) return
    setStatus('sending'); setError(''); setLink('')
    try {
      const res = await fetch('https://n8n.kikitte.com/webhook/momupay-payment-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), memo, salonId, salonName }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (!data.url) throw new Error()
      setLink(data.url); setCopied(false); setStatus('idle')
    } catch { setError('リンクの発行に失敗しました'); setStatus('error') }
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(link) } catch { const el = document.getElementById('d-link'); el?.select(); document.execCommand('copy') }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <h2 style={h2}>決済リンク発行</h2>
      <div style={card}>
        <div style={fieldGroup}>
          <label style={label}>金額 <span style={{ color: C.terra, fontSize: 12 }}>*</span></label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: C.bark }}>¥</span>
            <input style={input} type="text" inputMode="numeric" placeholder="5,000"
              value={amount ? Number(amount).toLocaleString() : ''}
              onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))} />
          </div>
        </div>
        <div style={fieldGroup}>
          <label style={label}>メモ（任意）</label>
          <textarea style={{ ...input, resize: 'vertical', minHeight: 70 }} placeholder="全身もみほぐし60分" value={memo} onChange={e => setMemo(e.target.value)} />
        </div>
        <button style={{ ...btn, ...((!amount || Number(amount) <= 0 || status === 'sending') ? { opacity: .5, cursor: 'not-allowed' } : {}) }}
          onClick={generate} disabled={!amount || Number(amount) <= 0 || status === 'sending'}>
          {status === 'sending' ? '発行中...' : '決済リンクを発行する'}
        </button>
        {status === 'error' && error && <div style={errBox}>{error}</div>}
        {link && (
          <div style={{ marginTop: 20, background: C.sageL, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.sage, marginBottom: 8 }}>決済リンクが発行されました</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input id="d-link" readOnly value={link} style={{ ...input, flex: 1, fontSize: 13, fontFamily: fontEn }} />
              <button style={{ ...btn, width: 'auto', background: C.terra, padding: '10px 18px', fontSize: 13 }} onClick={copy}>コピー</button>
            </div>
            {copied && <div style={{ fontSize: 12, color: C.sage, marginTop: 6, fontWeight: 700 }}>コピーしました</div>}
          </div>
        )}
      </div>
    </>
  )
}

/* ── Reservations ── */
function ReservationsTab() {
  return (
    <>
      <h2 style={h2}>予約一覧</h2>
      <div style={{ ...card, overflowX: 'auto' }}>
        <Table
          cols={['日時', '顧客名', 'メニュー', '金額', 'ステータス']}
          rows={MOCK_RESERVATIONS.map(r => [r.date, r.customer, r.menu, `¥${r.amount.toLocaleString()}`, <Badge key={r.id} s={r.status} />])}
        />
      </div>
    </>
  )
}

/* ── Customers ── */
function CustomersTab() {
  return (
    <>
      <h2 style={h2}>顧客管理</h2>
      <div style={{ ...card, overflowX: 'auto' }}>
        <Table
          cols={['名前', 'メール', '来店回数', '最終来店日']}
          rows={MOCK_CUSTOMERS.map(c => [c.name, c.email, `${c.visits}回`, c.lastVisit])}
        />
      </div>
    </>
  )
}

/* ── Sales ── */
function SalesTab() {
  const max = Math.max(...MOCK_DAILY_SALES.map(d => d.amount))
  const total = MOCK_DAILY_SALES.reduce((s, d) => s + d.amount, 0)
  return (
    <>
      <h2 style={h2}>売上管理</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: C.mocha }}>今月の売上合計</div>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: fontEn, color: C.terra, marginTop: 8 }}>¥{total.toLocaleString()}</div>
        </div>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: C.mocha }}>日平均</div>
          <div style={{ fontSize: 28, fontWeight: 900, fontFamily: fontEn, color: C.sage, marginTop: 8 }}>¥{Math.round(total / MOCK_DAILY_SALES.length).toLocaleString()}</div>
        </div>
      </div>
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>日別売上</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180 }}>
          {MOCK_DAILY_SALES.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, color: C.mocha, fontFamily: fontEn }}>{d.amount > 0 ? `${(d.amount / 1000).toFixed(0)}k` : ''}</div>
              <div style={{ width: '100%', maxWidth: 32, background: d.amount > 0 ? C.terra : C.sand, borderRadius: '4px 4px 0 0', height: max > 0 ? `${(d.amount / max) * 140}px` : 0, minHeight: d.amount > 0 ? 4 : 0, transition: 'height .3s' }} />
              <div style={{ fontSize: 10, color: C.mocha }}>{d.day}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ── Menus ── */
function MenusTab() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h2 style={{ ...h2, marginBottom: 0 }}>メニュー管理</h2>
        <button style={{ ...btn, width: 'auto', padding: '10px 24px', fontSize: 14 }}>+ メニューを追加</button>
      </div>
      <div style={{ ...card, overflowX: 'auto' }}>
        <Table
          cols={['メニュー名', '時間', '金額']}
          rows={MOCK_MENUS.map(m => [m.name, `${m.duration}分`, `¥${m.price.toLocaleString()}`])}
        />
      </div>
    </>
  )
}

/* ── Settings ── */
function SettingsTab() {
  return (
    <>
      <h2 style={h2}>設定</h2>
      <div style={card}>
        <div style={fieldGroup}><label style={label}>サロン名</label><input style={input} defaultValue="テストサロン" /></div>
        <div style={fieldGroup}><label style={label}>メールアドレス</label><input style={input} defaultValue="test@example.com" /></div>
        <div style={fieldGroup}><label style={label}>電話番号</label><input style={input} defaultValue="090-1234-5678" /></div>
        <button style={{ ...btn, marginTop: 8 }}>保存する</button>
      </div>
    </>
  )
}

/* ══════════════════════════════════════════
   Shared UI
   ══════════════════════════════════════════ */

function Badge({ s }) {
  const colors = { '確定': { bg: C.sageL, color: C.sage }, '仮予約': { bg: '#FEF9E7', color: C.gold }, 'キャンセル': { bg: '#fef2f2', color: '#dc2626' } }
  const c = colors[s] || { bg: C.sand, color: C.mocha }
  return <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: c.bg, color: c.color }}>{s}</span>
}

function Table({ cols, rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr>{cols.map((c, i) => <th key={i} style={{ textAlign: 'left', padding: '10px 12px', borderBottom: `2px solid ${C.sand}`, fontSize: 12, color: C.mocha, fontWeight: 700, whiteSpace: 'nowrap' }}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri % 2 === 0 ? C.white : C.cream }}>
            {row.map((cell, ci) => <td key={ci} style={{ padding: '10px 12px', borderBottom: `1px solid ${C.sand}`, whiteSpace: 'nowrap' }}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ── shared styles ── */
const h2 = { fontSize: 20, fontWeight: 900, marginBottom: 20 }
const card = { background: C.white, borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(92,74,50,.06)', marginBottom: 20 }
const fieldGroup = { marginBottom: 18 }
const label = { display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6, color: C.espresso }
const input = { width: '100%', padding: '11px 14px', border: `1.5px solid ${C.sand}`, borderRadius: 10, fontFamily: font, fontSize: 15, background: C.white, color: C.espresso, outline: 'none', boxSizing: 'border-box' }
const btn = { width: '100%', padding: '13px 24px', border: 'none', borderRadius: 12, background: C.espresso, color: C.cream, fontFamily: font, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'block' }
const errBox = { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginTop: 14, color: '#dc2626', fontSize: 14 }

/* ══════════════════════════════════════════
   Main Dashboard layout
   ══════════════════════════════════════════ */

function Dashboard() {
  const [searchParams] = useSearchParams()
  const salonId = searchParams.get('salonId') || ''
  const salonName = searchParams.get('salonName') || 'MomuPay加盟店'

  const [tab, setTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const content = {
    home: <HomeTab />, pay: <PayTab salonId={salonId} salonName={salonName} />, reservations: <ReservationsTab />,
    customers: <CustomersTab />, sales: <SalesTab />, menus: <MenusTab />, settings: <SettingsTab />,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: font, color: C.espresso, background: C.cream }}>
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 90 }} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, background: C.espresso, color: C.cream, padding: '20px 0', zIndex: 100,
        display: 'flex', flexDirection: 'column', transition: 'transform .3s',
        transform: typeof window !== 'undefined' && window.innerWidth <= 768 && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', marginBottom: 32 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.terra, color: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600 }}>M</div>
          <span style={{ fontFamily: fontEn, fontWeight: 700, fontSize: 18 }}>Momu<span style={{ color: C.terra }}>Pay</span></span>
        </div>
        <nav style={{ flex: 1 }}>
          {TABS.map(t => (
            <div key={t.key}
              onClick={() => { setTab(t.key); setSidebarOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', cursor: 'pointer', fontSize: 14, fontWeight: tab === t.key ? 700 : 400,
                background: tab === t.key ? 'rgba(255,255,255,.1)' : 'transparent', borderLeft: tab === t.key ? `3px solid ${C.terra}` : '3px solid transparent',
                transition: 'all .15s',
              }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: '12px 20px', fontSize: 12, color: C.mocha }}>{salonName}</div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: typeof window !== 'undefined' && window.innerWidth > 768 ? 240 : 0, minWidth: 0 }}>
        {/* Top bar (mobile) */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: C.white, borderBottom: `1px solid ${C.sand}`, position: 'sticky', top: 0, zIndex: 80 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 4 }}
            className="dash-hamburger">
            <span style={{ display: 'block', width: 20, height: 2, background: C.espresso, borderRadius: 2 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: C.espresso, borderRadius: 2 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: C.espresso, borderRadius: 2 }} />
          </button>
          <span style={{ fontFamily: fontEn, fontWeight: 700, fontSize: 16 }}>Momu<span style={{ color: C.terra }}>Pay</span></span>
          <div style={{ width: 28 }} />
        </header>

        <main style={{ padding: 24, maxWidth: 960 }}>
          {content[tab]}
        </main>
      </div>

      {/* Responsive CSS via style tag */}
      <style>{`
        @media(min-width:769px){.dash-hamburger{display:none!important}}
      `}</style>
    </div>
  )
}

export default Dashboard
