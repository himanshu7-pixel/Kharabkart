import { useEffect, useState } from 'react'
import { api } from '../api.js'
import SearchLoader from '../components/SearchLoader.jsx'
import ProductCard, { useOpenProduct } from './ProductCard.jsx'

const MIN_SUFFERING_MS = 4500

export default function Search({ q }) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const open = useOpenProduct()

  useEffect(() => {
    const wait = new Promise((r) => setTimeout(r, MIN_SUFFERING_MS))
    Promise.all([api.search(q), wait]).then(([d]) => setData(d)).catch((e) => setErr(e.message))
  }, [q])

  if (err) return <p className="error">{err}</p>
  if (!data) return <SearchLoader query={q} />

  return (
    <div className="search-results">
      {data.results.length ? (
        <>
          <h2>Found {data.results.length} result{data.results.length > 1 ? 's' : ''} for “{q}” in the entire universe</h2>
          <p className="muted">Sorted by whatever we felt like.</p>
          <div className="grid">{data.results.map((p) => <ProductCard key={p._id} product={p} onOpen={open} />)}</div>
        </>
      ) : (
        <>
          <h2>We searched the whole universe. “{q}” does not exist.</h2>
          <p className="muted">Did you mean: <i>potato</i>? Here are some things you definitely don't need instead:</p>
          <div className="grid">{data.fallback.map((p) => <ProductCard key={p._id} product={p} onOpen={open} />)}</div>
        </>
      )}
    </div>
  )
}
