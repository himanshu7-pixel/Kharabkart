import { useEffect, useRef, useState } from 'react'
import { api, rupees } from '../api.js'
import { navigate } from '../router.js'
import { confirmAddToCart, usePopup } from '../components/Popups.jsx'
import DodgeButton from '../components/DodgeButton.jsx'
import SlapPopup from '../components/SlapPopup.jsx'
import ProductImage from '../components/ProductImage'

const SLAP_AFTER_MS = 30000

export default function Product({ slug, onCartChange }) {
  const ask = usePopup()
  const [p, setP] = useState(null)
  const [err, setErr] = useState('')
  const [wobble, setWobble] = useState(0)
  const [viewers, setViewers] = useState(2394)
  const [slap, setSlap] = useState(false)
  const timer = useRef()

  useEffect(() => { api.product(slug).then(setP).catch((e) => setErr(e.message)) }, [slug])

  const startSlapTimer = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setSlap(true), SLAP_AFTER_MS)
  }

  useEffect(() => {
    if (!p) return
    startSlapTimer()
    const t = setInterval(() => {
      setWobble(Math.round((Math.random() - 0.3) * 40))
      setViewers((v) => v + Math.round((Math.random() - 0.4) * 300))
    }, 3000)
    return () => { clearTimeout(timer.current); clearInterval(t) }
  }, [p])

  if (err) return <p className="error">{err}</p>
  if (!p) return <p className="loading">Loading product… Looking at it requires patience.</p>

  const livePrice = Math.max(1, Math.round(p.price * (1 + wobble / 100)))

  const add = async () => {
    clearTimeout(timer.current)
    if (!(await confirmAddToCart(ask, p))) return
    onCartChange(await api.addToCart(p._id))
    await ask({ icon: '🛒', title: 'Gotcha! Added to cart.', body: 'You chased it, you caught it, now you buy it. No take-backs.', buttons: [{ label: 'Take me to checkout', value: true, kind: 'primary' }] })
    clearTimeout(timer.current)
    navigate('/checkout')
  }

  const buyNow = async () => {
    setSlap(false)
    clearTimeout(timer.current)
    onCartChange(await api.addToCart(p._id))
    navigate('/checkout')
  }

  return (
    <div className="product">
      <a href="#/" className="back">← Back to the chaos</a>
      <div className="product-layout">
        <div className="product-image">
          <ProductImage product={p} className="hero-photo" />
          <p className="tiny">Actual product may look nothing like this.</p>
        </div>
        <div className="product-info">
          <h1>{p.name}</h1>
          <p className="tagline">{p.tagline}</p>
          <div className="live-price">
            <span className="big">{rupees(livePrice)}</span>
            <s>{rupees(p.mrp)}</s>
            <span className={wobble > 0 ? 'bad' : 'good'}>{wobble > 0 ? `▲ ${wobble}%` : `▼ ${-wobble}%`}</span>
          </div>
          <p className="tiny">Live price, changes every 3 seconds depending on your mood. You will be charged {rupees(p.price)} anyway.</p>
          <p className="urgency">🔥 Only 1 left! {viewers.toLocaleString('en-IN')} people are viewing this. 3 are judging you.</p>
          <p>{p.description}</p>

          <div className="actions">
            <button className="btn buy-now" onClick={buyNow}>⚡ Buy Now</button>
            <DodgeButton onClick={add}>🛒 Add to Cart</DodgeButton>
          </div>

          <h3>Customer reviews</h3>
          {p.reviews.map((r, i) => (
            <div className="review" key={i}>
              <b>{r.user}</b> <span className="stars">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </div>
      {slap && (
        <SlapPopup
          onBuy={buyNow}
          onClose={() => { setSlap(false); startSlapTimer() }}
        />
      )}
    </div>
  )
}
