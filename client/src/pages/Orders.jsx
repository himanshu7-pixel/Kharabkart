import { useEffect, useState } from 'react'
import { api, rupees } from '../api.js'
import { usePopup } from '../components/Popups.jsx'
import CaptchaModal from '../components/CaptchaModal.jsx'

export default function Orders({ highlight }) {
  const ask = usePopup()
  const [orders, setOrders] = useState(null)
  const [captcha, setCaptcha] = useState(null)

  useEffect(() => { api.orders().then(setOrders).catch(() => setOrders([])) }, [])

  const start = async (order, action) => {
    const ok = await ask({
      icon: action === 'cancel' ? '😱' : '📦',
      title: `${action === 'cancel' ? 'Cancel' : 'Return'} this order?`,
      body: 'To protect our feelings, you must first prove you are a human by solving a small (huge) calculus problem.',
      buttons: [{ label: 'Bring it on', value: true, kind: 'primary' }, { label: 'Never mind', value: false }],
    })
    if (ok) setCaptcha({ order, action })
  }

  const done = async (updated) => {
    setCaptcha(null)
    setOrders((os) => os.map((o) => (o._id === updated._id ? updated : o)))
    await ask({
      icon: '🧮',
      title: `Order ${updated.status}. You are officially a human.`,
      body: 'Your refund will be credited in 7–10 business lifetimes.',
    })
  }

  if (!orders) return <p className="loading">Loading your regrets…</p>
  if (!orders.length) return <div className="empty"><div className="big-emoji">📭</div><h2>No regrets yet.</h2><a className="btn primary" href="#/">Fix that</a></div>

  return (
    <div className="orders">
      <h1>My Regrets (Orders)</h1>
      {orders.map((o) => (
        <div className={`order ${o._id === highlight ? 'new' : ''}`} key={o._id}>
          <div className="order-head">
            <span>Order #{o._id.slice(-6).toUpperCase()}</span>
            <span className={`status ${o.status}`}>{o.status}</span>
          </div>
          {o.items.map((i, idx) => <div className="line" key={idx}><span>{i.emoji} {i.name} × {i.qty}</span><span>{rupees(i.price * i.qty)}</span></div>)}
          <div className="line total"><span>Total (with surprise fees)</span><span>{rupees(o.total)}</span></div>
          <p className="tiny">🚚 {o.shipping} · ETA: {o.eta}</p>
          {o.status === 'placed' && (
            <div className="order-actions">
              <button className="btn" onClick={() => start(o, 'cancel')}>Cancel order</button>
              <button className="btn" onClick={() => start(o, 'return')}>Return item</button>
            </div>
          )}
        </div>
      ))}
      {captcha && <CaptchaModal order={captcha.order} action={captcha.action} onDone={done} onClose={() => setCaptcha(null)} />}
    </div>
  )
}
