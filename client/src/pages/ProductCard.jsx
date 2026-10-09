import { rupees } from '../api.js'
import { navigate } from '../router.js'
import { usePopup } from '../components/Popups.jsx'
import ProductImage from '../components/ProductImage'

export function useOpenProduct() {
  const ask = usePopup()
  return async (p) => {
    await ask({
      icon: '🧐',
      title: 'Are you sure you want to look at this product?',
      body: `"${p.name}" is very shy. Looking at it might make it blush.`,
      buttons: [
        { label: 'Yes, show me', value: 'yes', kind: 'primary' },
        { label: 'No (opening it anyway)', value: 'no' },
      ],
    })
    navigate(`/product/${p.slug}`)
  }
}

export default function ProductCard({ product, onOpen }) {
  const off = Math.round(((product.price - product.mrp) / product.mrp) * 100)
  return (
    <button className="card" onClick={() => onOpen(product)}>
      <div className="card-emoji"><ProductImage product={product} /></div>
      <h4>{product.name}</h4>
      <p className="tagline">{product.tagline}</p>
      <div className="prices">
        <b>{rupees(product.price)}</b>
        <s>{rupees(product.mrp)}</s>
        <span className={off > 0 ? 'bad' : 'good'}>{off > 0 ? `${off}% MORE` : `${-off}% off`}</span>
      </div>
    </button>
  )
}
