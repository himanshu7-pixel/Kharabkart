import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api.js'
import { navigate, useRoute } from './router.js'
import { PopupProvider, usePopup } from './components/Popups.jsx'
import Home from './pages/Home.jsx'
import Product from './pages/Product.jsx'
import Search from './pages/Search.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Orders from './pages/Orders.jsx'
import CaricatureBackground from './components/CaricatureBackground.jsx'

const CATEGORIES = [
  { key: '', label: 'All Cursed Items', icon: '🔥' },
  { key: 'birthday', label: 'Special Birthday Items', icon: '🎂' },
  { key: 'food', label: 'Food Items', icon: '🍳' },
  { key: 'travel', label: 'Travel Items', icon: '✈️' },
  { key: 'summer', label: 'Summer Special', icon: '❄️' },
]

const TICKER = [
  '⚠️ WARNING: Do not try to return any item (math exam required)',
  '🩴 Mom\'s flying chappal is back in stock',
  '✈️ Boeing 777 now at ₹77,77,777 (doors optional)',
  '🔥 Prices increased by 300% just for you',
  '🎁 Buy 1, Get 0 Free',
  '⏳ Limited time offer (ends never)',
]

function Header({ cartCount, orderCount }) {
  const route = useRoute()
  const [q, setQ] = useState(route.params.get('q') || '')
  const [typing, setTyping] = useState(false)
  const timer = useRef()
  const activeCat = route.parts.length ? null : route.params.get('cat') || ''

  const onChange = (e) => {
    setQ(e.target.value)
    setTyping(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setTyping(false), 1200)
  }

  const submit = (e) => {
    e.preventDefault()
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}&t=${Date.now()}`)
  }

  return (
    <div className="topbar">
      <div className="ticker"><span>{TICKER.join('     •     ')}</span></div>
      <header className="header">
        <a href="#/" className="logo">
          <span className="logo-mark">🛒</span>
          <span className="logo-text">
            <span className="logo-name">KharabKart <em className="logo-badge">Worst Ever</em></span>
            <small>"Satisfaction is a Myth · Regret is Guaranteed"</small>
          </span>
        </a>
        <form className="search" onSubmit={submit}>
          <span className="search-icon">🔍</span>
          <input value={q} onChange={onChange} placeholder="Search for regret, chappal, jets, dung cake…" />
          <button className="search-btn">Search</button>
          {typing && q && <div className="typing-hint">Searching the whole universe only for you…</div>}
        </form>
        <nav>
          <a href="#/orders" className="nav-btn">📦 My Orders <b>{orderCount}</b></a>
          <a href="#/cart" className="nav-btn nav-cart">🛒 Cart <b>{cartCount}</b></a>
        </nav>
      </header>
      <div className="cat-pills">
        {CATEGORIES.map((c) => (
          <a key={c.key} href={c.key ? `#/?cat=${c.key}` : '#/'} className={`pill pill-${c.key || 'all'}${activeCat === c.key ? ' active' : ''}`}>
            {c.icon} {c.label}
          </a>
        ))}
      </div>
    </div>
  )
}

function Footer({ email, onEmail }) {
  const ask = usePopup()
  const shown = email || 'your_guilty_conscience@regret.com'

  const testLuck = async () => {
    await ask({ icon: '🎰', title: 'Spinning the wheel of fortune…', body: 'Calculating your luck using a 17th-order differential equation.' })
    await ask({ icon: '🪙', title: 'Congratulations! You won ₹0.', body: 'It has been credited to your account. Please allow 7–10 business years.', buttons: [{ label: 'Try again (win ₹0 again)', value: true, kind: 'primary' }] })
  }

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>🛒 KharabKart</h3>
          <p>India's most disappointing shopping portal. Built with anti-user design, dodging buttons, 30-second slaps, and zero customer satisfaction.</p>
          <span className="footer-stamp">★ Certified Disappointment ★</span>
        </div>

        <div className="footer-card grievance">
          <span className="footer-badge">Customer Grievance Desk</span>
          <h4>For querry contact: Yourself</h4>
          <div className="footer-row">
            <span className="footer-label">👤 Contact:</span>
            <div><b className="footer-chip">Yourself</b> <i>(Ask yourself why you bought this)</i></div>
          </div>
          <div className="footer-row">
            <span className="footer-label">📧 Email ID:</span>
            <i>(Your email itself)</i>
          </div>
          <input className="footer-email" type="email" value={email} placeholder="your_guilty_conscience@regret.com" onChange={(e) => onEmail(e.target.value)} />
          <p className="footer-note">→ Please email <a href={`mailto:${shown}`}>{shown}</a> for help. Nobody here is answering.</p>
          <div className="footer-row location">
            <span className="footer-label">📍 Location:</span>
            <div><b className="footer-chip">Hell</b> 7th Circle, Boiling Pitch Avenue, Suite 666, Underworld. <i>(Take a wrong turn in life, keep going straight)</i></div>
          </div>
        </div>

        <div className="footer-card refund">
          <h4>Refund Policy</h4>
          <p>Returns are only accepted if you successfully solve the 17th-order differential operator captcha within 10 seconds. In 99.999% of cases, your return will diverge in Hilbert space and you will receive an extra Cow Dung Cake.</p>
          <button className="footer-luck" onClick={testLuck}>Test Your Luck (Win 0 Rs)</button>
        </div>
      </div>
      <p className="footer-copy">© 2026 KharabKart. All wrongs reserved. Prices may change while you blink. No refunds, only regrets.</p>
    </footer>
  )
}

function Shell() {
  const ask = usePopup()
  const route = useRoute()
  const [cart, setCart] = useState([])
  const [email, setEmail] = useState(() => localStorage.getItem('kk-email') || '')
  const cartRef = useRef(cart)
  cartRef.current = cart

  const refreshCart = useCallback(() => api.cart().then(setCart).catch(() => {}), [])
  useEffect(() => { refreshCart() }, [refreshCart])

  const [orderCount, setOrderCount] = useState(0)
  useEffect(() => { api.orders().then((o) => setOrderCount(o.length)).catch(() => {}) }, [route.path])

  const saveEmail = (value) => {
    setEmail(value)
    localStorage.setItem('kk-email', value)
  }

  const askEmail = useCallback(async () => {
    let value = ''
    const ok = await ask({
      ambient: true,
      icon: '📧',
      title: 'Enter your email',
      body: (
        <>
          <p>We need it so that you can contact yourself for customer support.</p>
          <input className="full" type="email" placeholder="you@example.com" onChange={(e) => { value = e.target.value }} />
        </>
      ),
      buttons: [{ label: 'Save', value: true, kind: 'primary' }, { label: 'I prefer to stay mysterious', value: false }],
    })
    if (ok && value.includes('@')) saveEmail(value.trim())
  }, [ask])

  useEffect(() => {
    if (!localStorage.getItem('kk-email-asked')) {
      const t = setTimeout(() => {
        localStorage.setItem('kk-email-asked', '1')
        askEmail()
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [askEmail])

  useEffect(() => {
    let busy = false
    const nothing = async () => {
      if (busy) return
      busy = true
      const claim = await ask({
        ambient: true,
        icon: '🎉',
        title: 'Congratulations! You have won absolutely nothing.',
        body: 'You are our 1,000,000th visitor today. Again.',
        buttons: [{ label: 'Claim my nothing', value: true, kind: 'primary' }, { label: 'I don\'t want nothing', value: false }],
      })
      if (claim !== undefined) await ask({
        icon: claim ? '🏆' : '😢',
        title: claim ? 'Nothing has been credited to your account.' : 'Too late. Nothing has been credited anyway.',
        body: 'Please allow 7–10 business years for it to reflect.',
      })
      busy = false
    }
    const first = setTimeout(nothing, 25000)
    const repeat = setInterval(nothing, 75000)
    return () => { clearTimeout(first); clearInterval(repeat) }
  }, [ask])

  useEffect(() => {
    let last = 0
    let open = false
    const onLeave = async (e) => {
      if (e.clientY > 0 || open || Date.now() - last < 20000) return
      open = true
      last = Date.now()
      await ask({
        ambient: true,
        icon: '🥺',
        title: "Wait! Don't leave us.",
        body: cartRef.current.length ? 'We are emotionally attached to your cart.' : 'We are emotionally attached to your empty cart. And to you.',
        buttons: [{ label: 'Okay, I\'ll stay', value: true, kind: 'primary' }, { label: 'I am staying anyway', value: false }],
      })
      open = false
    }
    const beforeUnload = (e) => {
      if (cartRef.current.length) { e.preventDefault(); e.returnValue = '' }
    }
    document.documentElement.addEventListener('mouseleave', onLeave)
    window.addEventListener('beforeunload', beforeUnload)
    return () => {
      document.documentElement.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [ask])

  const [page, arg] = route.parts
  let content
  if (page === 'product') content = <Product slug={arg} onCartChange={setCart} />
  else if (page === 'search') content = <Search key={route.params.get('t')} q={route.params.get('q') || ''} />
  else if (page === 'cart') content = <Cart cart={cart} setCart={setCart} />
  else if (page === 'checkout') content = <Checkout cart={cart} email={email} onEmail={saveEmail} onPlaced={() => setCart([])} />
  else if (page === 'orders') content = <Orders highlight={route.params.get('new')} />
  else content = <Home cat={route.params.get('cat') || ''} />

  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      <CaricatureBackground />
      <Header cartCount={count} orderCount={orderCount} />
      <main>{content}</main>
      <Footer email={email} onEmail={saveEmail} />
    </>
  )
}

export default function App() {
  return (
    <PopupProvider>
      <Shell />
    </PopupProvider>
  )
}
