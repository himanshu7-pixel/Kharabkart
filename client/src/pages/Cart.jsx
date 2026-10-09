import { api, rupees } from '../api.js'
import { navigate } from '../router.js'
import { usePopup } from '../components/Popups.jsx'
import ProductImage from '../components/ProductImage'

export default function Cart({ cart, setCart }) {
  const ask = usePopup()

  const remove = async (item) => {
    const ok = await ask({
      icon: '💔',
      title: `Remove ${item.product.name}?`,
      body: 'This item has feelings. It already told its family it found a home.',
      buttons: [{ label: 'Keep it', value: false, kind: 'primary' }, { label: 'Remove (heartless)', value: true }],
    })
    if (ok) setCart(await api.removeFromCart(item._id))
  }

  const setQty = async (item, qty) => setCart(await api.updateCart(item._id, qty))

  if (!cart.length) {
    return (
      <div className="empty">
        <div className="big-emoji">🛒💨</div>
        <h2>Your cart is empty. Like your promises.</h2>
        <a className="btn primary" href="#/">Go waste money</a>
      </div>
    )
  }

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0)

  return (
    <div className="cart">
      <h1>Your Cart</h1>
      {cart.map((item) => (
        <div className="cart-row" key={item._id}>
          <span className="cart-emoji"><ProductImage product={item.product} /></span>
          <div className="grow">
            <b>{item.product.name}</b>
            <p className="tiny">{rupees(item.product.price)} each</p>
          </div>
          <label className="qty">
            Qty: {item.qty}
            <input type="range" min="1" max="99" value={item.qty} onChange={(e) => setQty(item, e.target.value)} />
          </label>
          <b>{rupees(item.product.price * item.qty)}</b>
          <button className="btn ghost" onClick={() => remove(item)}>🗑️</button>
        </div>
      ))}
      <div className="cart-total">
        <span>Subtotal (before surprise fees): <b>{rupees(subtotal)}</b></span>
        <button className="btn primary" onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
      </div>
    </div>
  )
}
