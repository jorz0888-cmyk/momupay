import { Link } from 'react-router-dom'

const s = {
  page: { minHeight: '100vh', background: '#FAF6F1', fontFamily: "'Zen Maru Gothic', sans-serif", color: '#2C2418' },
  header: { background: '#fff', borderBottom: '1px solid #E8DDD0', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px' },
  logoMark: { width: 36, height: 36, borderRadius: 10, background: '#2C2418', color: '#FAF6F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600 },
  logoText: { fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: '#2C2418' },
  logoAccent: { color: '#C4745A' },
  main: { maxWidth: 760, margin: '40px auto', padding: '0 24px 60px' },
  pageTitle: { fontSize: 26, fontWeight: 900, marginBottom: 24, textAlign: 'center' },
  card: { background: '#fff', borderRadius: 20, padding: '32px 32px', boxShadow: '0 4px 20px rgba(92,74,50,.06)', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 900, marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid #E8DDD0', color: '#2C2418' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', padding: '12px 14px', background: '#FAF6F1', fontSize: 13, whiteSpace: 'nowrap', width: 150, borderBottom: '1px solid #E8DDD0', color: '#5C4A32', fontWeight: 700, verticalAlign: 'top' },
  td: { padding: '12px 14px', fontSize: 14, borderBottom: '1px solid #E8DDD0', color: '#2C2418', lineHeight: 1.7 },
  section: { marginBottom: 18, fontSize: 14, lineHeight: 1.9, color: '#2C2418' },
  subhead: { fontSize: 14, fontWeight: 700, margin: '18px 0 6px', color: '#2C2418' },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 13, color: '#8B7355' },
  link: { color: '#C4745A', fontWeight: 700, textDecoration: 'none' },
}

/* Responsive: stack th/td on narrow viewports */
const responsiveCss = `
@media(max-width:600px){
  .legal-table th { display:block; width:auto; border-bottom:none; padding-bottom:4px }
  .legal-table td { display:block; padding-top:4px; padding-bottom:14px }
}
`

function Legal() {
  return (
    <div style={s.page}>
      <style>{responsiveCss}</style>
      <header style={s.header}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={s.logoMark}>M</div>
          <span style={s.logoText}>Momu<span style={s.logoAccent}>Pay</span></span>
        </Link>
      </header>

      <main style={s.main}>
        <h1 style={s.pageTitle}>利用規約・各種ポリシー</h1>

        {/* 特定商取引法に基づく表記 */}
        <section style={s.card} id="tokusho">
          <h2 style={s.cardTitle}>特定商取引法に基づく表記</h2>
          <table className="legal-table" style={s.table}>
            <tbody>
              <tr><th style={s.th}>事業者名（屋号）</th><td style={s.td}>MomuPay</td></tr>
              <tr><th style={s.th}>運営責任者</th><td style={s.td}>吉田 竜史</td></tr>
              <tr><th style={s.th}>所在地</th><td style={s.td}>〒101-0024 東京都千代田区神田和泉町1-6-16 ヤマトビル405</td></tr>
              <tr><th style={s.th}>電話番号</th><td style={s.td}>請求があった場合には速やかに開示いたします</td></tr>
              <tr><th style={s.th}>メールアドレス</th><td style={s.td}>info@momupay.com</td></tr>
              <tr><th style={s.th}>サービス内容</th><td style={s.td}>リラクゼーションサロン向けの予約管理および決済代行サービス</td></tr>
              <tr><th style={s.th}>販売価格</th><td style={s.td}>各加盟サロンが設定する施術料金に準じます。料金は各サロンの予約ページに表示されます。</td></tr>
              <tr><th style={s.th}>料金</th><td style={s.td}>決済手数料: 決済金額の6.8%（税込）。初期費用・月額費用は無料。</td></tr>
              <tr><th style={s.th}>追加手数料</th><td style={s.td}>決済手数料（6.8%）以外の手数料はございません。即時入金をご希望の場合のみ、別途 1.5% の手数料がかかります。</td></tr>
              <tr><th style={s.th}>支払方法</th><td style={s.td}>クレジットカード（Visa, Mastercard, Amex, JCB）</td></tr>
              <tr><th style={s.th}>支払時期</th><td style={s.td}>サービス予約確定時に決済</td></tr>
              <tr><th style={s.th}>決済期間</th><td style={s.td}>クレジットカード決済は即時処理されます。</td></tr>
              <tr><th style={s.th}>サービス提供時期</th><td style={s.td}>
                <div><strong>サロンへのご予約：</strong>決済完了と同時に予約確定（即時）</div>
                <div style={{ marginTop: 6 }}><strong>施術サービス：</strong>各サロンの予約日時に提供</div>
                <div style={{ marginTop: 6 }}><strong>加盟サロン向け決済代行サービス：</strong>審査完了後、通常3営業日以内</div>
              </td></tr>
              <tr><th style={s.th}>返品・キャンセル</th><td style={{ ...s.td, borderBottom: 'none' }}>
                <strong style={{ display: 'block', marginBottom: 4 }}>＜予約日時の24時間前まで＞</strong>
                無料でキャンセル可能（全額返金）。
                <strong style={{ display: 'block', margin: '10px 0 4px' }}>＜予約日時の24時間前以降＞</strong>
                各サロンのキャンセルポリシーに準じ、キャンセル料が発生する場合があります。
                <strong style={{ display: 'block', margin: '10px 0 4px' }}>＜システム障害等当社起因による決済エラーの場合＞</strong>
                即時全額返金。
                <div style={{ marginTop: 10 }}>返金処理はご利用のクレジットカード会社を通じて、通常 3～10 営業日以内に行われます。</div>
              </td></tr>
            </tbody>
          </table>
        </section>

        {/* プライバシーポリシー */}
        <section style={s.card} id="privacy">
          <h2 style={s.cardTitle}>プライバシーポリシー</h2>
          <p style={s.section}>
            MomuPay（以下「当社」）は、お客様の個人情報保護を重要な責務と認識し、以下のとおりプライバシーポリシーを定めます。
          </p>
          <h3 style={s.subhead}>1. 収集する情報</h3>
          <p style={s.section}>氏名、メールアドレス、電話番号、クレジットカード情報（決済処理会社を通じて安全に処理）、予約履歴、サロン情報。</p>
          <h3 style={s.subhead}>2. 利用目的</h3>
          <p style={s.section}>予約管理および決済処理、サービスの提供・改善、お問い合わせへの対応、法令に基づく対応。</p>
          <h3 style={s.subhead}>3. 第三者提供</h3>
          <p style={s.section}>法令に基づく場合、お客様の同意がある場合、決済処理に必要な範囲を除き、第三者に提供しません。</p>
          <h3 style={s.subhead}>4. 安全管理</h3>
          <p style={s.section}>PCI DSS準拠の決済基盤で処理。カード情報は当社サーバーに保存されません。</p>
          <h3 style={s.subhead}>5. お問い合わせ</h3>
          <p style={s.section}>info@momupay.com までご連絡ください。</p>
        </section>

        {/* 利用規約 */}
        <section style={s.card} id="terms">
          <h2 style={s.cardTitle}>利用規約</h2>
          <h3 style={s.subhead}>第1条（適用）</h3>
          <p style={s.section}>本規約は、MomuPay（以下「当社」）が提供する予約管理・決済代行サービスの利用条件を定めるものです。</p>
          <h3 style={s.subhead}>第2条（サービス内容）</h3>
          <p style={s.section}>リラクゼーションサロンに対し、オンライン予約管理機能およびクレジットカード決済代行サービスを提供します。</p>
          <h3 style={s.subhead}>第3条（利用料金）</h3>
          <p style={s.section}>決済金額の6.8%（税込）。初期費用・月額固定費用なし。</p>
          <h3 style={s.subhead}>第4条（売上金の支払い）</h3>
          <p style={s.section}>サロン様への売上振込は毎週金曜日、ご登録の銀行口座へ自動入金されます。振込手数料は無料です。即時入金をご希望の場合は、別途 1.5% の手数料がかかります。</p>
          <h3 style={s.subhead}>第5条（禁止事項）</h3>
          <p style={s.section}>法令違反、権利侵害、虚偽情報登録等を禁止します。</p>
          <h3 style={s.subhead}>第6条（免責）</h3>
          <p style={s.section}>当社の故意・重過失を除き、サービス利用に起因する損害について責任を負いません。</p>
          <h3 style={s.subhead}>第7条（準拠法・管轄）</h3>
          <p style={s.section}>日本法準拠。東京地方裁判所を専属的合意管轄とします。</p>
        </section>

        <div style={s.footer}>
          <Link to="/" style={s.link}>← MomuPayトップへ戻る</Link>
        </div>
      </main>
    </div>
  )
}

export default Legal
