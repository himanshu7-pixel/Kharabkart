import { useEffect, useState } from 'react'
import katex from 'katex'
import { api } from '../api.js'

function Tex({ src, block }) {
  const html = katex.renderToString(src, { displayMode: block, throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

const WRONG = [
  'Wrong. Are you even human?',
  'Incorrect. A robot would have solved this by now.',
  'Nope. Your JEE coaching fees were wasted.',
  'Wrong again. Sharma ji ka beta solved it in 3 seconds.',
  'Still wrong. Maybe keep the product?',
]

export default function CaptchaModal({ order, action, onDone, onClose }) {
  const [challenge, setChallenge] = useState(null)
  const [answer, setAnswer] = useState('')
  const [msg, setMsg] = useState('')
  const [hint, setHint] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async (note) => {
    setChallenge(null)
    setHint(null)
    setAnswer('')
    setMsg(note || '')
    try {
      setChallenge(await api.captcha(order._id, action))
    } catch (e) {
      setMsg(e.message)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!challenge || busy) return
    setBusy(true)
    try {
      const res = await api.verify(order._id, challenge.captchaId, answer)
      if (res.ok) return onDone(res.order)
      if (res.expired) return load('That CAPTCHA expired. Here is a fresh one.')
      setMsg(WRONG[(res.attempts - 1) % WRONG.length])
      if (res.hint) setHint(res.hint)
    } catch (err) {
      setMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overlay" style={{ zIndex: 1500 }}>
      <form className="popup captcha" onSubmit={submit}>
        <div className="popup-icon">🤖</div>
        <h3>Prove you are human to {action} this order</h3>
        <p className="muted">Only real humans can solve this. Robots and lazy people cannot. Solve it:</p>
        <div className="problem">{challenge ? <Tex src={challenge.latex} block /> : 'Generating suffering…'}</div>
        <input
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer, e.g. 0.3551 or 2 - pi^2/6"
        />
        <p className="tiny">Accepted: numbers or expressions using pi, e, sqrt(), ln(), exp(), ^. Answers are checked to 0.1% accuracy.</p>
        {msg && <p className="error">{msg}</p>}
        {hint && (
          <p className="hint">
            Fine, here is a hint because we pity you: the answer is <Tex src={hint} />
          </p>
        )}
        <div className="popup-buttons">
          <button className="btn primary" disabled={!challenge || busy}>Verify I am human</button>
          <button type="button" className="btn" onClick={() => load('Here is an easier one. (It is not easier.)')}>Give me an easier one</button>
          <button type="button" className="btn ghost" onClick={onClose}>Keep my order</button>
        </div>
      </form>
    </div>
  )
}
