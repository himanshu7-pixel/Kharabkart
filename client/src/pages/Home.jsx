import { useEffect, useState } from 'react'
import { api } from '../api.js'
import ProductCard, { useOpenProduct } from './ProductCard.jsx'

export default function Home({ cat }) {
  const [cats, setCats] = useState(null)
  const [err, setErr] = useState('')
  const open = useOpenProduct()

  useEffect(() => { api.categories().then(setCats).catch((e) => setErr(e.message)) }, [])

  if (err) return <p className="error">{err}</p>
  if (!cats) return <p className="loading">Loading products… (we are slow on purpose)</p>

  return (
    <div className="home">
      <section className="hero">
        <h1>Shop things nobody asked for.</h1>
        <p>India's most trusted* online store. <span className="tiny">*by nobody</span></p>
      </section>
      {cats.filter((c) => !cat || c.key === cat).map((c) => (
        <section key={c.key} className={`category cat-${c.key}`}>
          <h2>{c.title}</h2>
          <p className="muted">{c.blurb}</p>
          <div className="grid">
            {c.products.map((p) => <ProductCard key={p._id} product={p} onOpen={open} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
