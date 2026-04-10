import { useState, useEffect, useRef } from 'react'
import './App.css'

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1400&q=80',
  feature1: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80',
  feature2: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
  feature3: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&q=80',
  cta: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1400&q=80',
}

function App() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [legalOpen, setLegalOpen] = useState(null)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const observerRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setVisibleSections(prev => new Set([...prev, e.target.id]))
        }
      })
    }, { threshold: 0.15 })

    document.querySelectorAll('[data-animate]').forEach(el => {
      observerRef.current.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      observerRef.current?.disconnect()
    }
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }

  const toggleLegal = (id) => {
    setLegalOpen(legalOpen === id ? null : id)
    if (legalOpen !== id) {
      setTimeout(() => document.getElementById('legal')?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  const vis = (id) => visibleSections.has(id) ? 'section--visible' : ''

  return (
    <div className="app">
      {/* NAV */}
      <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <div className="nav__inner">
          <div className="nav__logo" onClick={() => scrollTo('hero')}>
            <span className="logo-mark">M</span>
            <span className="logo-text">Momu<span className="logo-accent">Pay</span></span>
          </div>
          <button className="hamburger" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <ul className={`nav__links ${mobileMenu ? 'open' : ''}`}>
            <li onClick={() => scrollTo('about')}>MomuPayとは</li>
            <li onClick={() => scrollTo('features')}>特徴</li>
            <li onClick={() => scrollTo('flow')}>ご利用の流れ</li>
            <li onClick={() => setShowPricing(true)} className="nav__pricing">料金</li>
            <li onClick={() => scrollTo('contact')} className="nav__cta-link">お問い合わせ</li>
          </ul>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="hero">
        <div className="hero__img" style={{ backgroundImage: `url(${IMAGES.hero})` }} />
        <div className="hero__overlay" />
        <div className="hero__content">
          <div className="hero__badge">Relaxation Salon Platform</div>
          <h1>
            予約も決済も、<br />
            <span className="hero__em">もむっと</span>かんたん。
          </h1>
          <p>リラクゼーションサロン専用の予約管理・決済代行プラットフォーム。<br className="hide-sp" />面倒な決済導入をまるごとお任せ、施術に集中できます。</p>
          <div className="hero__btns">
            <button className="btn btn--white" onClick={() => scrollTo('contact')}>無料で相談する</button>
            <button className="btn btn--glass" onClick={() => scrollTo('about')}>詳しく見る ↓</button>
          </div>
        </div>
        <div className="hero__scroll" onClick={() => scrollTo('about')}>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className={`about ${vis('about')}`} data-animate>
        <div className="container">
          <div className="about__grid">
            <div className="about__text">
              <span className="tag">About MomuPay</span>
              <h2>サロン経営を、<br />もっとシンプルに。</h2>
              <p>MomuPayは、リラクゼーションサロンのオーナー様が予約受付からオンライン決済まで、ひとつのプラットフォームで完結できるサービスです。</p>
              <p>初期費用・月額費用は一切不要。お客様がオンラインで予約・事前決済できるので、当日の会計がスムーズになり、無断キャンセルも大幅に減少します。</p>
              <div className="about__stats">
                <div className="stat">
                  <span className="stat__num">0<small>円</small></span>
                  <span className="stat__label">初期費用・月額</span>
                </div>
                <div className="stat">
                  <span className="stat__num">3<small>日</small></span>
                  <span className="stat__label">最短導入日数</span>
                </div>
                <div className="stat">
                  <span className="stat__num">4<small>種</small></span>
                  <span className="stat__label">対応カードブランド</span>
                </div>
              </div>
            </div>
            <div className="about__img">
              <img src={IMAGES.feature1} alt="サロンイメージ" loading="lazy" />
              <div className="about__img-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={`features ${vis('features')}`} data-animate>
        <div className="container">
          <div className="features__head">
            <span className="tag">Features</span>
            <h2>MomuPayが<br className="hide-pc" />選ばれる理由</h2>
          </div>

          <div className="feat-row">
            <div className="feat-card feat-card--wide">
              <div className="feat-card__img">
                <img src={IMAGES.feature2} alt="予約管理" loading="lazy" />
              </div>
              <div className="feat-card__body">
                <div className="feat-card__icon">📅</div>
                <h3>予約管理の一元化</h3>
                <p>電話・LINE・Web予約をまとめて管理。ダブルブッキングや予約漏れを防ぎ、空き枠をリアルタイムで可視化します。</p>
              </div>
            </div>
            <div className="feat-card">
              <div className="feat-card__body">
                <div className="feat-card__icon">💳</div>
                <h3>かんたん決済導入</h3>
                <p>Visa / Mastercard / Amex / JCB対応。PCI DSS準拠の安全な決済基盤で、お客様のカード情報を安全に処理します。</p>
              </div>
            </div>
          </div>

          <div className="feat-row feat-row--reverse">
            <div className="feat-card">
              <div className="feat-card__body">
                <div className="feat-card__icon">🚫</div>
                <h3>ノーショー対策</h3>
                <p>事前決済で無断キャンセルを大幅削減。キャンセルポリシーもサロンごとに柔軟に設定できます。</p>
              </div>
            </div>
            <div className="feat-card feat-card--wide">
              <div className="feat-card__img">
                <img src={IMAGES.feature3} alt="リラクゼーション" loading="lazy" />
              </div>
              <div className="feat-card__body">
                <div className="feat-card__icon">📊</div>
                <h3>売上レポート＆分析</h3>
                <p>日別・月別の売上をリアルタイムで確認。施術メニュー別の分析で、経営の意思決定をサポートします。</p>
              </div>
            </div>
          </div>

          <div className="feat-row feat-row--trio">
            <div className="feat-mini"><span>📱</span><h4>スマホ完結</h4><p>予約・決済・管理すべてスマホで</p></div>
            <div className="feat-mini"><span>🔒</span><h4>安心セキュリティ</h4><p>国際基準PCI DSS準拠</p></div>
            <div className="feat-mini"><span>⚡</span><h4>即日振込対応</h4><p>最短翌営業日に売上入金</p></div>
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section id="flow" className={`flow ${vis('flow')}`} data-animate>
        <div className="container">
          <div className="flow__head">
            <span className="tag tag--dark">How it works</span>
            <h2>ご利用の流れ</h2>
          </div>
          <div className="flow__tracks">
            <div className="track">
              <h3 className="track__title">サロンオーナー様</h3>
              {[
                ['01','無料お申し込み','フォームから申請。最短3営業日で開始。'],
                ['02','サロン情報を登録','メニュー・料金・営業時間をかんたん入力。'],
                ['03','予約受付スタート','専用URLをお客様にシェアするだけ。'],
                ['04','売上をお受け取り','手数料差し引き後、定期的にお振込み。'],
              ].map(([n,t,d]) => (
                <div className="track__step" key={n}>
                  <div className="track__num">{n}</div>
                  <div><strong>{t}</strong><span>{d}</span></div>
                </div>
              ))}
            </div>
            <div className="track">
              <h3 className="track__title">お客様（予約者）</h3>
              {[
                ['01','メニューを選択','お好みの施術メニューを選びます。'],
                ['02','日時を予約','空き状況をリアルタイムで確認・選択。'],
                ['03','オンライン決済','クレジットカードで事前にお支払い。'],
                ['04','サロンでリラックス','会計不要。施術をお楽しみください。'],
              ].map(([n,t,d]) => (
                <div className="track__step" key={n}>
                  <div className="track__num">{n}</div>
                  <div><strong>{t}</strong><span>{d}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta__img" style={{ backgroundImage: `url(${IMAGES.cta})` }} />
        <div className="cta__overlay" />
        <div className="cta__content">
          <h2>まずは無料で<br />ご相談ください</h2>
          <p>導入のご相談・デモのご依頼など、お気軽にお問い合わせください。</p>
          <div className="cta__btns">
            <button className="btn btn--white" onClick={() => scrollTo('contact')}>お問い合わせ</button>
            <button className="btn btn--glass" onClick={() => setShowPricing(true)}>料金を見る</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`faq ${vis('faq')}`} data-animate>
        <div className="container">
          <span className="tag">FAQ</span>
          <h2>よくあるご質問</h2>
          {[
            ['導入にはどのくらい時間がかかりますか？','お申し込みから最短3営業日で利用開始いただけます。'],
            ['対応しているクレジットカードは？','Visa、Mastercard、American Express、JCBに対応しています。'],
            ['個人サロンでも利用できますか？','はい、個人事業主・自宅サロン・一人経営のサロンでもご利用いただけます。'],
            ['キャンセル・返金の対応は？','キャンセルポリシーはサロンごとに設定可能。返金もダッシュボードからかんたんに処理できます。'],
            ['解約に費用はかかりますか？','いいえ、いつでも無料で解約いただけます。'],
          ].map(([q,a],i) => (
            <div key={i} className={`faq-item ${legalOpen===`faq${i}`?'faq-item--open':''}`} onClick={() => setLegalOpen(legalOpen===`faq${i}`?null:`faq${i}`)}>
              <div className="faq-q"><span>{q}</span><span className="faq-tog">{legalOpen===`faq${i}`?'−':'+'}</span></div>
              {legalOpen===`faq${i}` && <div className="faq-a">{a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="contact">
        <div className="container">
          <span className="tag">Contact</span>
          <h2>お問い合わせ</h2>
          <p className="contact__sub">導入のご相談・ご質問はお気軽にどうぞ。</p>
          <div className="contact__cards">
            <div className="ccard"><div className="ccard__icon">✉️</div><h3>メール</h3><p className="ccard__val">info@momupay.com</p></div>
            <div className="ccard"><div className="ccard__icon">📞</div><h3>お電話</h3><p className="ccard__val">03-XXXX-XXXX</p><p className="ccard__note">平日 10:00〜18:00</p></div>
          </div>
        </div>
      </section>

      {/* LEGAL */}
      <section id="legal" className="legal">
        <div className="container">
          {[
            ['tokusho','特定商取引法に基づく表記',<table className="ltable"><tbody>
              <tr><th>事業者名</th><td>MomuPay（運営: ○○○○）</td></tr>
              <tr><th>代表者名</th><td>○○ ○○</td></tr>
              <tr><th>所在地</th><td>〒XXX-XXXX 東京都○○区○○ X-X-X</td></tr>
              <tr><th>電話番号</th><td>03-XXXX-XXXX</td></tr>
              <tr><th>メールアドレス</th><td>info@momupay.com</td></tr>
              <tr><th>サービス内容</th><td>リラクゼーションサロン向けの予約管理および決済代行サービス</td></tr>
              <tr><th>料金</th><td>決済手数料: 決済金額の8%（税込）。初期費用・月額費用は無料。</td></tr>
              <tr><th>支払方法</th><td>クレジットカード（Visa, Mastercard, Amex, JCB）</td></tr>
              <tr><th>支払時期</th><td>サービス予約確定時に決済</td></tr>
              <tr><th>サービス提供時期</th><td>審査完了次第（通常3営業日以内）</td></tr>
              <tr><th>返品・キャンセル</th><td>各サロンのキャンセルポリシーに準じます。</td></tr>
            </tbody></table>],
            ['privacy','プライバシーポリシー',<div>
              <p>MomuPay（以下「当社」）は、お客様の個人情報保護を重要な責務と認識し、以下のとおりプライバシーポリシーを定めます。</p>
              <h4>1. 収集する情報</h4><p>氏名、メールアドレス、電話番号、クレジットカード情報（決済処理会社を通じて安全に処理）、予約履歴、サロン情報。</p>
              <h4>2. 利用目的</h4><p>予約管理および決済処理、サービスの提供・改善、お問い合わせへの対応、法令に基づく対応。</p>
              <h4>3. 第三者提供</h4><p>法令に基づく場合、お客様の同意がある場合、決済処理に必要な範囲を除き、第三者に提供しません。</p>
              <h4>4. 安全管理</h4><p>PCI DSS準拠の決済基盤で処理。カード情報は当社サーバーに保存されません。</p>
              <h4>5. お問い合わせ</h4><p>info@momupay.com までご連絡ください。</p>
            </div>],
            ['terms','利用規約',<div>
              <h4>第1条（適用）</h4><p>本規約は、MomuPay（以下「当社」）が提供する予約管理・決済代行サービスの利用条件を定めるものです。</p>
              <h4>第2条（サービス内容）</h4><p>リラクゼーションサロンに対し、オンライン予約管理機能およびクレジットカード決済代行サービスを提供します。</p>
              <h4>第3条（利用料金）</h4><p>決済金額の8%（税込）。初期費用・月額固定費用なし。</p>
              <h4>第4条（売上金の支払い）</h4><p>手数料差し引き後、毎月15日締め・月末締めで指定口座にお振込みします。</p>
              <h4>第5条（禁止事項）</h4><p>法令違反、権利侵害、虚偽情報登録等を禁止します。</p>
              <h4>第6条（免責）</h4><p>当社の故意・重過失を除き、サービス利用に起因する損害について責任を負いません。</p>
              <h4>第7条（準拠法・管轄）</h4><p>日本法準拠。東京地方裁判所を専属的合意管轄とします。</p>
            </div>],
          ].map(([id,title,content]) => (
            <div className="lblock" key={id}>
              <h3 className="lblock__t" onClick={() => toggleLegal(id)}>{title}<span>{legalOpen===id?'−':'+'}</span></h3>
              {legalOpen===id && <div className="lblock__body">{content}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <span className="logo-mark logo-mark--light">M</span>
            <span className="logo-text" style={{ color: '#FAF6F1' }}>Momu<span className="logo-accent">Pay</span></span>
          </div>
          <p className="footer__desc">リラクゼーションサロン向け 予約管理・決済代行プラットフォーム</p>
          <div className="footer__links">
            <span onClick={() => toggleLegal('tokusho')}>特定商取引法に基づく表記</span>
            <span onClick={() => toggleLegal('privacy')}>プライバシーポリシー</span>
            <span onClick={() => toggleLegal('terms')}>利用規約</span>
          </div>
          <p className="footer__copy">© 2026 MomuPay. All rights reserved.</p>
        </div>
      </footer>

      {/* PRICING MODAL */}
      {showPricing && (
        <div className="modal-bg" onClick={() => setShowPricing(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal__close" onClick={() => setShowPricing(false)}>✕</button>
            <span className="tag">Pricing</span>
            <h2>料金プラン</h2>
            <p className="modal__sub">初期費用・月額費用は一切かかりません。</p>
            <div className="modal__card">
              <div className="modal__badge">スタンダードプラン</div>
              <div className="modal__price">
                <span className="modal__num">8</span>
                <span className="modal__pct">%</span>
                <span className="modal__per">/ 決済ごと</span>
              </div>
              <ul>
                <li>✓ 初期費用 無料</li>
                <li>✓ 月額費用 無料</li>
                <li>✓ オンライン決済（Visa / Mastercard / Amex / JCB）</li>
                <li>✓ 予約管理機能</li>
                <li>✓ 売上レポート・分析</li>
                <li>✓ ノーショー対策機能</li>
                <li>✓ メール・チャットサポート</li>
                <li>✓ 振込手数料 無料（月2回）</li>
              </ul>
              <button className="btn btn--dark btn--full" onClick={() => { setShowPricing(false); scrollTo('contact') }}>無料で始める</button>
            </div>
            <p className="modal__note">※ 決済手数料にはクレジットカード処理手数料が含まれます。<br />※ 売上振込は15日締め・月末締めの月2回。</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
