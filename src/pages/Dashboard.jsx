import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PaymentQrOverlay from '../components/PaymentQrOverlay.jsx'
import { supabase } from '../lib/supabase.js'

/* ── color tokens ── */
const C = {
  cream: '#FAF6F1', warm: '#F3EAE0', sand: '#E8DDD0', mocha: '#8B7355',
  bark: '#5C4A32', espresso: '#2C2418', sage: '#7A9E7E', sageL: '#EAF2EB',
  terra: '#C4745A', gold: '#D4A853', white: '#fff',
}
const font = "'Zen Maru Gothic', sans-serif"
const fontEn = "'DM Sans', sans-serif"

const TABS = [
  { key: 'home', label: 'ダッシュボード', icon: '📊' },
  { key: 'pay', label: 'お会計リンク', icon: '🔗' },
  { key: 'sales', label: '売上の動き', icon: '💰' },
  { key: 'settings', label: '設定', icon: '⚙️' },
]

/* ══════════════════════════════════════════
   Sub-views
   ══════════════════════════════════════════ */

/* ── Home ── */

/** Aggregate this-month / last-month succeeded charges from the
 *  /momupay-get-charges payload. `created` is a Stripe-style unix
 *  timestamp in seconds; we compare against the operator's local
 *  month boundaries which is what they intuitively expect.
 */
function calcMonthlySummary(charges) {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  let thisMonthAmount = 0, thisMonthCount = 0
  let lastMonthAmount = 0, lastMonthCount = 0

  charges.forEach(c => {
    if (c.status !== 'succeeded') return
    const date = new Date((Number(c.created) || 0) * 1000)
    if (date >= thisMonthStart) {
      thisMonthAmount += Number(c.amount || 0)
      thisMonthCount++
    } else if (date >= lastMonthStart && date <= lastMonthEnd) {
      lastMonthAmount += Number(c.amount || 0)
      lastMonthCount++
    }
  })

  const monthOverMonthPct = lastMonthAmount > 0
    ? Math.round(((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100)
    : null

  return { thisMonthAmount, thisMonthCount, lastMonthAmount, lastMonthCount, monthOverMonthPct }
}

function KpiCard({ label, value, sub, subColor, color }) {
  return (
    <div style={{ background: C.white, borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 12px rgba(92,74,50,.06)' }}>
      <div style={{ fontSize: 13, color: C.mocha, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, fontFamily: fontEn, color, lineHeight: 1.15, wordBreak: 'break-all' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: subColor || C.mocha, marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div style={{ background: C.white, borderRadius: 16, padding: '24px 20px', boxShadow: '0 2px 12px rgba(92,74,50,.06)' }}>
      <div style={{ height: 12, width: '40%', background: C.sand, borderRadius: 4, marginBottom: 14 }} />
      <div style={{ height: 28, width: '70%', background: C.sand, borderRadius: 6, marginBottom: 10 }} />
      <div style={{ height: 10, width: '50%', background: C.sand, borderRadius: 4 }} />
    </div>
  )
}

function HomeTab({ salonId, onSeeAll }) {
  const [charges, setCharges] = useState([])
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasFetched, setHasFetched] = useState(false)

  const fetchAll = async () => {
    if (!salonId) return
    setLoading(true)
    setError(null)
    try {
      const [chargesRes, balanceRes] = await Promise.all([
        fetch('https://n8n.kikitte.com/webhook/momupay-get-charges', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ salonId, limit: 100 }),
        }),
        fetch('https://n8n.kikitte.com/webhook/momupay-get-balance', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ salonId }),
        }),
      ])
      if (!chargesRes.ok || !balanceRes.ok) throw new Error('データの取得に失敗しました')
      const chargesData = await chargesRes.json()
      const balanceData = await balanceRes.json()
      setCharges(chargesData.charges || [])
      setBalance(balanceData || null)
    } catch (e) {
      setError(e.message || 'データの取得に失敗しました')
    } finally {
      setLoading(false)
      setHasFetched(true)
    }
  }

  useEffect(() => {
    if (!salonId) return
    fetchAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId])

  const summary = calcMonthlySummary(charges)
  const recent = charges.slice(0, 5)

  /* MoM display: "+12%" green / "-5%" red / "—" muted when last month had zero */
  let momText = '—'
  let momColor = C.mocha
  if (summary.monthOverMonthPct != null) {
    const v = summary.monthOverMonthPct
    momText = `前月比 ${v >= 0 ? '+' : ''}${v}%`
    momColor = v >= 0 ? C.sage : '#dc2626'
  }

  /* Upcoming-payout card values.
     The card shows total upcoming = available + pending so it doesn't
     drop to ¥0 the moment Stripe moves a charge from pending into the
     available bucket (which happens ~7 days after capture). The sub-
     line then disambiguates which portion is which. */
  const available = Math.max(0, Number(balance?.available || 0))
  const pending = Math.max(0, Number(balance?.pending || 0))
  const totalUpcoming = available + pending

  let payoutSub
  if (available > 0 && pending > 0) {
    payoutSub = `次回入金 ¥${available.toLocaleString()} ／ 保留中 ¥${pending.toLocaleString()}`
  } else if (available > 0) {
    payoutSub = '次回入金: 近日中'
  } else if (pending > 0) {
    payoutSub = '次回入金は調整中です'
  } else {
    payoutSub = 'お会計をお待ちしています'
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ ...h2, marginBottom: 4 }}>サロンとお客様を、もっと軽やかに。</h2>
        <p style={{ fontSize: 13, color: C.mocha, lineHeight: 1.7 }}>今日のお会計と、これからの動きをここに。</p>
      </div>

      {!salonId ? (
        <div style={{ ...card }}>サロンIDが設定されていないため、ダッシュボード情報を表示できません。</div>
      ) : error ? (
        <div style={{ ...card }}>
          <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{error}</div>
          <button
            onClick={fetchAll}
            style={{ ...btn, width: 'auto', padding: '10px 20px', fontSize: 13, background: C.terra }}
          >
            再試行
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
            {loading && !hasFetched ? (
              <>
                <KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
              </>
            ) : (
              <>
                <KpiCard
                  label="今月の売上"
                  value={`¥${summary.thisMonthAmount.toLocaleString()}`}
                  sub={momText}
                  subColor={momColor}
                  color={C.terra}
                />
                <KpiCard
                  label="今月のお会計件数"
                  value={`${summary.thisMonthCount}件`}
                  sub={summary.lastMonthCount > 0 ? `前月: ${summary.lastMonthCount}件` : null}
                  color={C.sage}
                />
                <KpiCard
                  label="入金予定額"
                  value={`¥${totalUpcoming.toLocaleString()}`}
                  sub={payoutSub}
                  color={C.gold}
                />
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900 }}>最近のお会計</h3>
            {onSeeAll && (
              <button
                onClick={onSeeAll}
                style={{ background: 'transparent', border: 'none', color: C.terra, fontFamily: font, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0 }}
              >
                すべて見る
              </button>
            )}
          </div>

          {loading && !hasFetched ? (
            <div style={{ ...card, color: C.mocha, fontSize: 14, textAlign: 'center' }}>読み込み中...</div>
          ) : recent.length === 0 ? (
            <div style={{ ...card, color: C.mocha, fontSize: 14, textAlign: 'center' }}>まだお会計はありません</div>
          ) : (
            <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.cream }}>
                    <th style={salesTh}>日時</th>
                    <th style={{ ...salesTh, textAlign: 'right' }}>金額</th>
                    <th style={salesTh}>お客様名</th>
                    <th style={salesTh}>施術内容</th>
                    <th style={salesTh}>ステータス</th>
                    <th style={salesTh}>お会計コード</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c, i) => {
                    const customerName = cleanField(c.customer_name)
                    const memo = cleanField(c.memo)
                    return (
                      <tr key={c.payment_intent_id || c.payment_code || i}
                        style={{ background: i % 2 === 0 ? C.white : C.cream, height: 48 }}>
                        <td style={{ ...salesTd, whiteSpace: 'nowrap', fontFamily: fontEn, fontSize: 12, color: C.bark }}>{c.created_jst || '—'}</td>
                        <td style={{ ...salesTd, textAlign: 'right', whiteSpace: 'nowrap', fontFamily: fontEn, fontWeight: 700 }}>¥{Number(c.amount || 0).toLocaleString()}</td>
                        <td style={{ ...salesTd, whiteSpace: 'nowrap' }}>{customerName || '—'}</td>
                        <td style={{ ...salesTd }}>{memo || '—'}</td>
                        <td style={{ ...salesTd, whiteSpace: 'nowrap' }}><StatusBadge status={c.status} /></td>
                        <td style={{ ...salesTd, whiteSpace: 'nowrap', fontFamily: fontEn, fontSize: 12, color: C.mocha }}>{c.payment_code || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}

/* ── Pay ── */
function PayTab({ salonId, salonName }) {
  const [amount, setAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [memo, setMemo] = useState('')
  const [link, setLink] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [issuedAmount, setIssuedAmount] = useState(0)
  const [issuedCustomerName, setIssuedCustomerName] = useState('')
  const [issuedMemo, setIssuedMemo] = useState('')
  const [showQrFullscreen, setShowQrFullscreen] = useState(false)

  const generate = async () => {
    if (!amount || Number(amount) <= 0) return
    setStatus('sending'); setError(''); setLink('')
    try {
      const res = await fetch('https://n8n.kikitte.com/webhook/momupay-payment-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), customerName, memo, salonId, salonName }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (!data.url) throw new Error()
      setLink(data.url)
      setIssuedAmount(Number(amount))
      setIssuedCustomerName(customerName)
      setIssuedMemo(memo)
      setCopied(false); setStatus('idle')
      setShowQrFullscreen(true)
    } catch { setError('リンクの発行に失敗しました'); setStatus('error') }
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(link) } catch { const el = document.getElementById('d-link'); el?.select(); document.execCommand('copy') }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <h2 style={h2}>お会計リンクを発行する</h2>
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
          <label style={label}>お客様名（任意）</label>
          <div style={hint}>※ サロン側の控え用です。お客様には表示されません。</div>
          <input style={input} type="text" placeholder="例：田中様（サロン控え用）" value={customerName} onChange={e => setCustomerName(e.target.value)} />
        </div>
        <div style={fieldGroup}>
          <label style={label}>施術内容（任意）</label>
          <div style={hint}>※ お客様のお支払い画面に表示されます。実際の内容を正確にご入力ください。</div>
          <input style={input} type="text" placeholder="例：全身もみほぐし60分（お客様に表示）" value={memo} onChange={e => setMemo(e.target.value)} />
        </div>
        <button style={{ ...btn, ...((!amount || Number(amount) <= 0 || status === 'sending') ? { opacity: .5, cursor: 'not-allowed' } : {}) }}
          onClick={generate} disabled={!amount || Number(amount) <= 0 || status === 'sending'}>
          {status === 'sending' ? '発行中...' : 'お会計リンクを発行する'}
        </button>
        {status === 'error' && error && <div style={errBox}>{error}</div>}
        {link && (
          <div style={{ marginTop: 20, background: C.sageL, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.sage, marginBottom: 10 }}>お会計リンクを発行しました</div>
            <div style={{ background: C.white, borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, lineHeight: 1.8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: C.mocha, width: 60, flexShrink: 0 }}>金額</span>
                <span style={{ fontWeight: 700 }}>¥{issuedAmount.toLocaleString()}</span>
              </div>
              {issuedCustomerName && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: C.mocha, width: 60, flexShrink: 0 }}>お客様</span>
                  <span>{issuedCustomerName}</span>
                </div>
              )}
              {issuedMemo && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: C.mocha, width: 60, flexShrink: 0 }}>施術</span>
                  <span>{issuedMemo}</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input id="d-link" readOnly value={link} style={{ ...input, flex: 1, fontSize: 13, fontFamily: fontEn }} />
              <button style={{ ...btn, width: 'auto', background: C.terra, padding: '10px 18px', fontSize: 13 }} onClick={copy}>コピー</button>
            </div>
            {copied && <div style={{ fontSize: 12, color: C.sage, marginTop: 6, fontWeight: 700 }}>コピーしました</div>}
            <button
              style={{ ...btn, width: '100%', background: C.espresso, padding: '12px 18px', fontSize: 13, marginTop: 12 }}
              onClick={() => setShowQrFullscreen(true)}
            >
              QRを再表示
            </button>
          </div>
        )}
      </div>
      {showQrFullscreen && link && (
        <PaymentQrOverlay
          url={link}
          amount={issuedAmount}
          memo={issuedMemo}
          onClose={() => setShowQrFullscreen(false)}
        />
      )}

      <SalesHistorySection salonId={salonId} />
    </>
  )
}

/* ── Sales history (last 20 charges from n8n) ── */
function cleanField(s) {
  if (s == null) return null
  let v = String(s).trim()
  if (!v) return null
  if (v.startsWith('=')) v = v.slice(1).trim()
  return v || null
}

function StatusBadge({ status }) {
  if (status === 'succeeded') {
    return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: C.sageL, color: C.sage, whiteSpace: 'nowrap' }}>✅ 成功</span>
  }
  if (status === 'failed') {
    return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: '#fef2f2', color: '#dc2626', whiteSpace: 'nowrap' }}>❌ 失敗</span>
  }
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: C.sand, color: C.mocha, whiteSpace: 'nowrap' }}>{status || '—'}</span>
}

function SalesHistorySection({ salonId }) {
  const [charges, setCharges] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasFetched, setHasFetched] = useState(false)

  const fetchCharges = async () => {
    if (!salonId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://n8n.kikitte.com/webhook/momupay-get-charges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId, limit: 20 }),
      })
      if (!res.ok) throw new Error('取得に失敗しました')
      const data = await res.json()
      setCharges(data.charges || [])
      setCount(data.count ?? (data.charges || []).length)
    } catch (e) {
      setError(e.message || '取得に失敗しました')
    } finally {
      setLoading(false)
      setHasFetched(true)
    }
  }

  useEffect(() => {
    if (!salonId) return
    fetchCharges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId])

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ ...h2, marginBottom: 0 }}>お会計の履歴</h2>
          {hasFetched && !error && (
            <span style={{ fontSize: 12, color: C.mocha, background: C.sand, padding: '2px 10px', borderRadius: 100, fontFamily: fontEn }}>
              直近{count}件
            </span>
          )}
        </div>
        <button
          onClick={fetchCharges}
          disabled={loading || !salonId}
          style={{ background: 'transparent', border: `1.5px solid ${C.sand}`, borderRadius: 10, padding: '7px 14px', fontFamily: font, fontSize: 13, fontWeight: 700, color: C.bark, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? '更新中...' : '🔄 更新'}
        </button>
      </div>

      {!salonId ? (
        <div style={{ ...card, color: C.mocha, fontSize: 13 }}>サロンIDが設定されていないため履歴を表示できません。</div>
      ) : loading && !hasFetched ? (
        <div style={{ ...card, color: C.mocha, fontSize: 14, textAlign: 'center' }}>読み込み中...</div>
      ) : error ? (
        <div style={{ ...card }}>
          <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{error}</div>
          <button
            onClick={fetchCharges}
            style={{ ...btn, width: 'auto', padding: '10px 20px', fontSize: 13, background: C.terra }}
          >
            再試行
          </button>
        </div>
      ) : charges.length === 0 ? (
        <div style={{ ...card, color: C.mocha, fontSize: 14, textAlign: 'center' }}>まだお会計はありません</div>
      ) : (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.cream }}>
                <th style={salesTh}>日時</th>
                <th style={{ ...salesTh, textAlign: 'right' }}>金額</th>
                <th style={salesTh}>お客様名</th>
                <th style={salesTh}>施術内容</th>
                <th style={salesTh}>ステータス</th>
                <th style={salesTh}>お会計コード</th>
              </tr>
            </thead>
            <tbody>
              {charges.map((c, i) => {
                const customerName = cleanField(c.customer_name)
                const memo = cleanField(c.memo)
                return (
                  <tr key={c.payment_intent_id || c.payment_code || i}
                    style={{ background: i % 2 === 0 ? C.white : C.cream, height: 48 }}>
                    <td style={{ ...salesTd, whiteSpace: 'nowrap', fontFamily: fontEn, fontSize: 12, color: C.bark }}>{c.created_jst || '—'}</td>
                    <td style={{ ...salesTd, textAlign: 'right', whiteSpace: 'nowrap', fontFamily: fontEn, fontWeight: 700 }}>¥{Number(c.amount || 0).toLocaleString()}</td>
                    <td style={{ ...salesTd, whiteSpace: 'nowrap' }}>{customerName || '—'}</td>
                    <td style={{ ...salesTd }}>{memo || '—'}</td>
                    <td style={{ ...salesTd, whiteSpace: 'nowrap' }}><StatusBadge status={c.status} /></td>
                    <td style={{ ...salesTd, whiteSpace: 'nowrap', fontFamily: fontEn, fontSize: 12, color: C.mocha }}>{c.payment_code || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const salesTh = { textAlign: 'left', padding: '12px 14px', fontSize: 12, color: C.mocha, fontWeight: 700, borderBottom: `1px solid ${C.sand}`, whiteSpace: 'nowrap' }
const salesTd = { padding: '10px 14px', borderBottom: `1px solid ${C.sand}`, color: C.espresso, verticalAlign: 'middle' }

/* ── Sales ── */

/** Roll up succeeded charges into the last `days` calendar days (operator-
 *  local timezone). Output preserves day order from oldest → today and
 *  fills zero-revenue days with `amount: 0` so the chart renders an
 *  unbroken axis.
 */
function calcDailySales(charges, days = 30) {
  const buckets = new Map()
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayMs = 24 * 60 * 60 * 1000

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * dayMs)
    const key = `${d.getMonth() + 1}/${d.getDate()}`
    buckets.set(key, 0)
  }

  charges.forEach(c => {
    if (c.status !== 'succeeded') return
    const d = new Date((Number(c.created) || 0) * 1000)
    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const dayDiff = Math.floor((startOfToday.getTime() - dStart.getTime()) / dayMs)
    if (dayDiff < 0 || dayDiff >= days) return
    const key = `${d.getMonth() + 1}/${d.getDate()}`
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + Number(c.amount || 0))
  })

  return Array.from(buckets, ([date, amount]) => ({ date, amount }))
}

function ChartSkeleton({ days = 30 }) {
  const heights = Array.from({ length: days }, (_, i) => 30 + ((i * 37) % 100))
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180, minWidth: days * 28 }}>
        {heights.map((h, i) => (
          <div key={i} style={{ flex: 1, minWidth: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, height: 12 }} />
            <div style={{ width: '100%', maxWidth: 32, background: C.sand, borderRadius: '4px 4px 0 0', height: h, opacity: 0.6 }} />
            <div style={{ fontSize: 10, height: 12 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function SalesTab({ salonId }) {
  const [charges, setCharges] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasFetched, setHasFetched] = useState(false)

  const fetchCharges = async () => {
    if (!salonId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://n8n.kikitte.com/webhook/momupay-get-charges', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId, limit: 100 }),
      })
      if (!res.ok) throw new Error('取得に失敗しました')
      const data = await res.json()
      setCharges(data.charges || [])
    } catch (e) {
      setError(e.message || '取得に失敗しました')
    } finally {
      setLoading(false)
      setHasFetched(true)
    }
  }

  useEffect(() => {
    if (!salonId) return
    fetchCharges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId])

  const summary = calcMonthlySummary(charges)
  const total = summary.thisMonthAmount
  const daysElapsed = new Date().getDate() // 1..31
  const dailyAvg = daysElapsed > 0 ? Math.round(total / daysElapsed) : 0

  const daily = calcDailySales(charges, 30)
  const max = Math.max(0, ...daily.map(d => d.amount))

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ ...h2, marginBottom: 4 }}>売上の動きを見る</h2>
        <p style={{ fontSize: 13, color: C.mocha, lineHeight: 1.7 }}>日々の積み重ねを、グラフで。</p>
      </div>

      {!salonId ? (
        <div style={{ ...card }}>サロンIDが設定されていないため、売上情報を表示できません。</div>
      ) : error ? (
        <div style={{ ...card }}>
          <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{error}</div>
          <button
            onClick={fetchCharges}
            style={{ ...btn, width: 'auto', padding: '10px 20px', fontSize: 13, background: C.terra }}
          >
            再試行
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 24 }}>
            {loading && !hasFetched ? (
              <>
                <KpiSkeleton /><KpiSkeleton />
              </>
            ) : (
              <>
                <div style={{ ...card, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: C.mocha }}>今月の売上合計</div>
                  <div style={{ fontSize: 28, fontWeight: 900, fontFamily: fontEn, color: C.terra, marginTop: 8 }}>¥{total.toLocaleString()}</div>
                </div>
                <div style={{ ...card, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: C.mocha }}>日平均</div>
                  <div style={{ fontSize: 28, fontWeight: 900, fontFamily: fontEn, color: C.sage, marginTop: 8 }}>¥{dailyAvg.toLocaleString()}</div>
                </div>
              </>
            )}
          </div>

          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>この30日のお会計</h3>
            {loading && !hasFetched ? (
              <ChartSkeleton days={30} />
            ) : charges.length === 0 ? (
              <div style={{ color: C.mocha, fontSize: 14, textAlign: 'center', padding: '40px 0' }}>これからのお会計を、ここで見守ります</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 180, minWidth: daily.length * 28 }}>
                  {daily.map((d, i) => {
                    const labelText = d.amount > 0
                      ? (d.amount >= 10000 ? `${(d.amount / 1000).toFixed(0)}k` : `${d.amount.toLocaleString()}円`)
                      : ''
                    return (
                      <div key={i} style={{ flex: 1, minWidth: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 10, color: C.mocha, fontFamily: fontEn, height: 14, whiteSpace: 'nowrap' }}>{labelText}</div>
                        <div style={{ width: '100%', maxWidth: 32, background: d.amount > 0 ? C.terra : C.sand, borderRadius: '4px 4px 0 0', height: max > 0 ? `${(d.amount / max) * 140}px` : 0, minHeight: d.amount > 0 ? 4 : 0, transition: 'height .3s' }} />
                        <div style={{ fontSize: 10, color: C.mocha, whiteSpace: 'nowrap' }}>{d.date}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
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

/* ── shared styles ── */
const h2 = { fontSize: 20, fontWeight: 900, marginBottom: 20 }
const card = { background: C.white, borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(92,74,50,.06)', marginBottom: 20 }
const fieldGroup = { marginBottom: 18 }
const label = { display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6, color: C.espresso }
const hint = { fontSize: 12, color: C.mocha, marginTop: 2, marginBottom: 6, lineHeight: 1.4 }
const input = { width: '100%', padding: '11px 14px', border: `1.5px solid ${C.sand}`, borderRadius: 10, fontFamily: font, fontSize: 15, background: C.white, color: C.espresso, outline: 'none', boxSizing: 'border-box' }
const btn = { width: '100%', padding: '13px 24px', border: 'none', borderRadius: 12, background: C.espresso, color: C.cream, fontFamily: font, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'block' }
const errBox = { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginTop: 14, color: '#dc2626', fontSize: 14 }

/* ══════════════════════════════════════════
   Auth-state placeholders
   ══════════════════════════════════════════ */

const placeholderKeyframes = `@keyframes momupay-dash-spin { to { transform: rotate(360deg) } }`

function DashboardSkeleton() {
  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: font, color: C.espresso, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{placeholderKeyframes}</style>
      <div style={{ background: C.white, borderRadius: 24, padding: '48px 32px', boxShadow: '0 8px 30px rgba(92,74,50,.08)', textAlign: 'center', maxWidth: 360, width: '100%' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${C.sand}`, borderTopColor: C.terra, margin: '0 auto 14px', animation: 'momupay-dash-spin 0.9s linear infinite' }} />
        <div style={{ fontSize: 13, color: C.mocha }}>サロン情報を読み込んでいます...</div>
      </div>
    </div>
  )
}

function SalonInfoMissing({ kind, salonName, onSignOut, signingOut }) {
  const isError = kind === 'error'
  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: font, color: C.espresso, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: C.white, borderRadius: 24, padding: '48px 32px', boxShadow: '0 8px 30px rgba(92,74,50,.08)', textAlign: 'center', maxWidth: 460, width: '100%' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F3EAE0', color: C.terra, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, margin: '0 auto 18px' }}>!</div>
        <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 12 }}>
          {isError ? 'サロン情報の読み込みに失敗しました' : 'サロン情報が見つかりません'}
        </h1>
        <p style={{ color: C.bark, fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>
          {isError ? (
            <>
              認証情報の取得中にエラーが発生しました。<br />
              一度ログアウトしてからもう一度お試しください。
            </>
          ) : (
            <>
              {salonName ? <><strong>{salonName}</strong> さん、</> : ''}
              ご登録は確認できましたが、<br />
              サロンID（Stripe アカウント）の登録が<br />
              まだ完了していないようです。
            </>
          )}
        </p>
        {!isError && (
          <p style={{ fontSize: 13, color: C.mocha, lineHeight: 1.8, marginBottom: 24 }}>
            お手数ですが、<a href="mailto:info@momupay.com" style={{ color: C.terra, fontWeight: 700 }}>info@momupay.com</a> までご連絡ください。<br />
            設定状況を確認の上、ご案内いたします。
          </p>
        )}
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          style={{
            background: 'transparent',
            border: `1.5px solid ${C.sand}`,
            borderRadius: 10,
            padding: '10px 24px',
            color: C.bark,
            fontFamily: font,
            fontWeight: 700,
            fontSize: 13,
            cursor: signingOut ? 'not-allowed' : 'pointer',
            opacity: signingOut ? 0.5 : 1,
          }}
        >
          {signingOut ? 'ログアウト中...' : 'ログアウトしてやり直す'}
        </button>
        <div style={{ marginTop: 18, fontSize: 12, color: C.mocha }}>
          <Link to="/" style={{ color: C.mocha, textDecoration: 'none' }}>← MomuPayトップへ戻る</Link>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   Main Dashboard layout
   ══════════════════════════════════════════ */

function Dashboard() {
  const navigate = useNavigate()

  // Auth-driven salon context. ProtectedRoute already guarantees we have a
  // session, but user_metadata can still be missing (e.g., a user that
  // signed in before Stripe onboarding wrote salonId back to Supabase).
  // States: loading | ready | nodata | error
  const [authStatus, setAuthStatus] = useState('loading')
  const [salonId, setSalonId] = useState('')
  const [salonName, setSalonName] = useState('')

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return
      const user = data?.user
      if (error || !user) {
        setAuthStatus('error')
        return
      }
      const metaId = user.user_metadata?.salonId
      const metaName = user.user_metadata?.salonName
      if (!metaId) {
        setSalonName(metaName || '')
        setAuthStatus('nodata')
        return
      }
      setSalonId(metaId)
      setSalonName(metaName || 'MomuPay加盟店')
      setAuthStatus('ready')
    }).catch(() => {
      if (mounted) setAuthStatus('error')
    })
    return () => { mounted = false }
  }, [])

  const [tab, setTab] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try { await supabase.auth.signOut() } catch { /* ignore — we navigate either way */ }
    navigate('/login', { replace: true })
  }

  const content = {
    home: <HomeTab salonId={salonId} onSeeAll={() => setTab('pay')} />, pay: <PayTab salonId={salonId} salonName={salonName} />,
    sales: <SalesTab salonId={salonId} />, settings: <SettingsTab />,
  }

  if (authStatus === 'loading') {
    return <DashboardSkeleton />
  }
  if (authStatus === 'error' || authStatus === 'nodata') {
    return (
      <SalonInfoMissing
        kind={authStatus}
        salonName={salonName}
        onSignOut={handleSignOut}
        signingOut={signingOut}
      />
    )
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
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.terra, color: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600 }}>M</div>
            <span style={{ fontFamily: fontEn, fontWeight: 700, fontSize: 18 }}>Momu<span style={{ color: C.terra }}>Pay</span></span>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: C.mocha, lineHeight: 1.5 }}>サロンのためのお会計プラットフォーム</div>
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
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: C.mocha }}>{salonName}</div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,.18)',
              borderRadius: 8,
              padding: '8px 12px',
              color: C.cream,
              fontFamily: font,
              fontSize: 12,
              fontWeight: 700,
              cursor: signingOut ? 'not-allowed' : 'pointer',
              opacity: signingOut ? 0.5 : 1,
              textAlign: 'left',
            }}
          >
            {signingOut ? 'ログアウト中...' : 'ログアウト'}
          </button>
        </div>
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
