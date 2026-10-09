import { useEffect } from 'react'

function playSlap() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const len = ctx.sampleRate * 0.25
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6)
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 800
    src.connect(filter).connect(ctx.destination)
    src.start(ctx.currentTime + 0.45)
    setTimeout(() => ctx.close(), 1500)
  } catch {
    /* audio not available */
  }
}

export default function SlapPopup({ onBuy, onClose }) {
  useEffect(() => {
    playSlap()
  }, [])

  return (
    <div className="overlay" style={{ zIndex: 2000 }}>
      <div className="popup slap-popup">
        <div className="slap-scene">
          <div className="slapper">
            <span className="face">😤</span>
            <span className="hand">🫲</span>
          </div>
          <div className="pow">SLAP!</div>
          <div className="victim">
            <span className="face face-before">😳</span>
            <span className="face face-after">😵‍💫</span>
          </div>
        </div>
        <div className="speech">“Chal le le n bey!”</div>
        <p className="muted">You have been staring at this product for 30 seconds. Decide already.</p>
        <div className="popup-buttons">
          <button className="btn primary" onClick={onBuy}>Le raha hu, le raha hu 🙏</button>
          <button className="btn" onClick={onClose}>Abhi aur dekhunga</button>
        </div>
      </div>
    </div>
  )
}
