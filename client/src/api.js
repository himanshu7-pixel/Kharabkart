function getClientId() {
  let id = localStorage.getItem('kk-client-id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('kk-client-id', id)
  }
  return id
}

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-client-id': getClientId() },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Something went wrong (on purpose)')
  return data
}

export const api = {
  categories: () => request('GET', '/api/categories'),
  product: (slug) => request('GET', `/api/products/${encodeURIComponent(slug)}`),
  search: (q) => request('GET', `/api/search?q=${encodeURIComponent(q)}`),
  cart: () => request('GET', '/api/cart'),
  addToCart: (productId, qty = 1) => request('POST', '/api/cart', { productId, qty }),
  updateCart: (id, qty) => request('PATCH', `/api/cart/${id}`, { qty }),
  removeFromCart: (id) => request('DELETE', `/api/cart/${id}`),
  placeOrder: (payload) => request('POST', '/api/orders', payload),
  orders: () => request('GET', '/api/orders'),
  captcha: (orderId, action) => request('POST', `/api/orders/${orderId}/captcha`, { action }),
  verify: (orderId, captchaId, answer) => request('POST', `/api/orders/${orderId}/verify`, { captchaId, answer }),
}

export const rupees = (n) => '₹' + Number(n).toLocaleString('en-IN')
