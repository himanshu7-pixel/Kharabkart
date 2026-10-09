import { useState } from 'react'
import { api, rupees } from '../api.js'
import { navigate } from '../router.js'
import { usePopup } from '../components/Popups.jsx'

const SHIPPING = [
  { key: 'pigeon', label: '🕊️ Carrier Pigeon (3–7 years)', fee: 0 },
  { key: 'bullock', label: '🐂 Bullock Cart Prime', fee: 49 },
  { key: 'express', label: '🚀 Express (slower)', fee: 999 },
]
const PAYMENTS = [
  { key: 'cod', label: '💵 Cash on Delivery (exact change only, in 1-rupee coins)' },
  { key: 'kidney', label: '🫘 One Kidney (EMI available on the second one)' },
  { key: 'emotional', label: '😭 Emotional Damage' },
]

export default function Checkout({ cart, email, onEmail, onPlaced }) {
  const ask = usePopup()
  const [form, setForm] = useState({ name: '', email: email || '', address: '', shipping: 'pigeon', payment: 'cod' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  if (!cart.length) {
    return <div className="empty"><h2>Nothing to checkout. Go add regrets first.</h2><a className="btn primary" href="#/">Shop</a></div>
  }

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0)
  const ship = SHIPPING.find((s) => s.key === form.shipping)
  const fees = ship.fee + 199 + 49 + 21

  const submit = async (e) => {
    e.preventDefault()
    const ok = await ask({
      icon: '⚠️',
      title: 'Place order?',
      body: 'Cancelling later requires solving a calculus problem. Just saying.',
      buttons: [{ label: 'Place order', value: true, kind: 'primary' }, { label: 'Wait, let me revise integration', value: false }],
    })
    if (!ok) return
    setBusy(true)
    try {
      const order = await api.placeOrder({
        customer: { name: form.name, email: form.email, address: form.address },
        shipping: form.shipping,
        payment: form.payment,
      })
      onEmail(form.email)
      onPlaced()
      await ask({ icon: '🎊', title: 'Order placed!', body: `Estimated delivery: ${order.eta}. Total charged: ${rupees(order.total)}.`, buttons: [{ label: 'See my regrets', value: true, kind: 'primary' }] })
      navigate(`/orders?new=${order._id}`)
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="checkout" onSubmit={submit}>
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <div>
          <label>Full name<input required value={form.name} onChange={set('name')} placeholder="As per Aadhaar, PAN and horoscope" /></label>
          <label>Email<input required type="email" value={form.email} onChange={set('email')} placeholder="So we can spam you" /></label>
          <label>Address<textarea required value={form.address} onChange={set('address')} placeholder="Include landmark, e.g. 'near the tree where the dog sleeps'" /></label>
          <fieldset>
            <legend>Shipping</legend>
            {SHIPPING.map((s) => (
              <label className="radio" key={s.key}>
                <input type="radio" name="ship" checked={form.shipping === s.key} onChange={() => setForm({ ...form, shipping: s.key })} />
                {s.label} — {s.fee ? rupees(s.fee) : 'FREE'}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Payment</legend>
            {PAYMENTS.map((p) => (
              <label className="radio" key={p.key}>
                <input type="radio" name="pay" checked={form.payment === p.key} onChange={() => setForm({ ...form, payment: p.key })} />
                {p.label}
              </label>
            ))}
          </fieldset>
        </div>
        <aside className="summary">
          <h3>Order summary</h3>
          {cart.map((i) => <div className="line" key={i._id}><span>{i.product.emoji} {i.product.name} × {i.qty}</span><span>{rupees(i.product.price * i.qty)}</span></div>)}
          <div className="line"><span>Shipping</span><span>{rupees(ship.fee)}</span></div>
          <div className="line"><span>Convenience fee (for your inconvenience)</span><span>{rupees(199)}</span></div>
          <div className="line"><span>Fee fee</span><span>{rupees(49)}</span></div>
          <div className="line"><span>Breathing tax</span><span>{rupees(21)}</span></div>
          <div className="line total"><span>Total</span><span>{rupees(subtotal + fees)}</span></div>
          {err && <p className="error">{err}</p>}
          <button className="btn primary full" disabled={busy}>{busy ? 'Processing your regret…' : 'Place Order'}</button>
        </aside>
      </div>
    </form>
  )
}
