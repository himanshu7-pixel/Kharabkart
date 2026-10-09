import { useEffect, useState } from 'react'

const MODELS = [
  { animal: '🐱', caption: 'Agent Meow is checking the Mars warehouse' },
  { animal: '🐶', caption: 'Sir Woofington posing for the product photoshoot' },
  { animal: '😼', caption: 'Cat is judging your search history' },
  { animal: '🐕', caption: 'Dog is negotiating with Jupiter for discounts' },
  { animal: '🐈', caption: 'Cat is shopping for herself instead' },
  { animal: '🐩', caption: 'Poodle is asking Saturn\'s rings for your size' },
]

const STATUS = [
  'Scanning Milky Way...',
  'Asking aliens nicely...',
  'Checking under the sofa...',
  'Waking up the server hamster...',
  'Bribing the black hole...',
  'Almost there (lying)...',
]

export default function SearchLoader({ query }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 900)
    return () => clearInterval(t)
  }, [])
  const progress = [12, 34, 51, 47, 78, 64, 91, 99, 98, 99][tick % 10]
  const shown = [0, 1, 2].map((i) => MODELS[(tick + i) % MODELS.length])

  return (
    <div className="search-loader">
      <h2 className="universe">Searching the whole universe only for you…</h2>
      {query && <p className="muted">Looking for “{query}” in 2 trillion galaxies</p>}
      <div className="models">
        {shown.map((m, i) => (
          <div className={`model pose-${(tick + i) % 3}`} key={i}>
            <div className="model-art">
              <span className="animal">{m.animal}</span>
              <span className="goggles">🥽</span>
              <span className="bag bag-l">🛍️</span>
              <span className="bag bag-r">🛍️</span>
            </div>
            <p>{m.caption}</p>
          </div>
        ))}
      </div>
      <div className="progress"><div style={{ width: `${progress}%` }} /></div>
      <p className="muted">{STATUS[tick % STATUS.length]} {progress}%</p>
    </div>
  )
}
