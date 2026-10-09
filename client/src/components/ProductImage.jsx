import { useState } from 'react'

export default function ProductImage({ product, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (failed || !product?.slug) return <span className={`emoji-fallback ${className}`}>{product?.emoji}</span>
  return (
    <img
      className={`product-photo ${className}`}
      src={`/products/${product.slug}.jpg`}
      alt={product.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
