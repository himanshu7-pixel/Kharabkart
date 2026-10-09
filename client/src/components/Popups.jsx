import { createContext, useCallback, useContext, useRef, useState } from 'react'

const PopupContext = createContext(null)

export function PopupProvider({ children }) {
  const [stack, setStack] = useState([])
  const nextId = useRef(1)

  const open = useRef(0)

  const ask = useCallback((opts) => new Promise((resolve) => {
    if (opts.ambient && (open.current > 0 || window.location.hash.startsWith('#/product'))) return resolve(undefined)
    open.current++
    const id = nextId.current++
    setStack((s) => [...s, { ...opts, id, resolve }])
  }), [])

  const close = (popup, value) => {
    open.current--
    setStack((s) => s.filter((p) => p.id !== popup.id))
    popup.resolve(value)
  }

  return (
    <PopupContext.Provider value={ask}>
      {children}
      {stack.map((p, i) => (
        <div className="overlay" key={p.id} style={{ zIndex: 1000 + i }}>
          <div className={`popup ${p.className || ''}`} style={{ transform: `rotate(${(i % 2 ? 1 : -1) * (1 + i)}deg)` }}>
            {p.icon && <div className="popup-icon">{p.icon}</div>}
            <h3>{p.title}</h3>
            {p.body && <div className="popup-body">{p.body}</div>}
            <div className="popup-buttons">
              {(p.buttons || [{ label: 'OK', value: true }]).map((b) => (
                <button key={b.label} className={`btn ${b.kind || ''}`} onClick={() => close(p, b.value)}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </PopupContext.Provider>
  )
}

export const usePopup = () => useContext(PopupContext)

export async function confirmAddToCart(ask, product) {
  const steps = [
    { icon: '👩‍👦', title: `Add "${product.name}" to cart? Would your mother approve?`, body: 'Think about her face when she sees this on the bank statement.' },
  ]
  for (const step of steps) {
    const ok = await ask({
      ...step,
      buttons: [
        { label: 'Yes', value: true, kind: 'primary' },
        { label: 'No', value: false },
      ],
    })
    if (!ok) {
      await ask({ icon: '😤', title: 'Fine. Be like that.', body: 'Your cart is crying now.', buttons: [{ label: 'Sorry', value: true }] })
      return false
    }
  }
  return true
}
