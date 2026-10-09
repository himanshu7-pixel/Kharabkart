import { useCallback, useEffect, useRef, useState } from 'react'

const GIVE_UP_AFTER = 12
const COOLDOWN_MS = 220
const EDGE = 16
const TAUNTS = ['Nope', 'Too slow', 'Missed me', 'Try Buy Now', 'Hehe', 'Not today', 'Catch me', 'Almost!', 'Buy Now is right there', 'Lol', 'So close']

export default function DodgeButton({ onClick, children }) {
  const btn = useRef(null)
  const lastJump = useRef(0)
  const [pos, setPos] = useState(null)
  const [dodges, setDodges] = useState(0)
  const tired = dodges >= GIVE_UP_AFTER

  const jump = useCallback((cx, cy) => {
    const now = Date.now()
    if (tired || !btn.current || now - lastJump.current < COOLDOWN_MS) return
    lastJump.current = now
    const b = btn.current.getBoundingClientRect()
    const maxX = Math.max(EDGE, window.innerWidth - b.width - EDGE)
    const maxY = Math.max(EDGE, window.innerHeight - b.height - EDGE)
    let best = { x: EDGE, y: EDGE, d: -1 }
    for (let i = 0; i < 10; i++) {
      const x = EDGE + Math.random() * (maxX - EDGE)
      const y = EDGE + Math.random() * (maxY - EDGE)
      const d = Math.hypot(x + b.width / 2 - cx, y + b.height / 2 - cy)
      if (d > best.d) best = { x, y, d }
    }
    setPos((current) => {
      if (current) return { x: best.x, y: best.y }
      requestAnimationFrame(() => setPos({ x: best.x, y: best.y }))
      return { x: b.left, y: b.top }
    })
    setDodges((n) => {
      const next = n + 1
      if (next >= GIVE_UP_AFTER) setTimeout(() => setPos(null), 600)
      return next
    })
  }, [tired])

  useEffect(() => {
    if (tired) return
    const onMove = (e) => {
      if (!btn.current) return
      const b = btn.current.getBoundingClientRect()
      const d = Math.hypot(b.left + b.width / 2 - e.clientX, b.top + b.height / 2 - e.clientY)
      if (d < Math.max(b.width, b.height) * 0.9) jump(e.clientX, e.clientY)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [tired, jump])

  const onTouch = (e) => {
    if (tired) return
    e.preventDefault()
    const t = e.touches[0]
    jump(t.clientX, t.clientY)
  }

  return (
    <div className="dodge-home">
      <button
        ref={btn}
        className={`btn dodge${pos ? ' roaming' : ''}${tired ? ' tired' : ''}`}
        style={pos ? { left: pos.x, top: pos.y } : undefined}
        onMouseEnter={(e) => jump(e.clientX, e.clientY)}
        onTouchStart={onTouch}
        onClick={tired ? onClick : (e) => jump(e.clientX, e.clientY)}
      >
        {tired ? 'Okay okay, I give up. Buy me 😮‍💨' : dodges ? TAUNTS[dodges % TAUNTS.length] : children}
      </button>
    </div>
  )
}
