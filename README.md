# KharabKart – The World's Worst E-Commerce Website (MERN)

Hilariously terrible, but fully functional: browse → product → cart → checkout → order → cancel/return.

## Stack
- **MongoDB** (Mongoose) – products, cart, orders
- **Express / Node** – REST API in `server/`
- **React (Vite)** – frontend in `client/`

## Run locally
```bash
npm run install:all
npm run dev:server   # API on http://localhost:5000
npm run dev:client   # UI on http://localhost:5173 (proxies /api to :5000)
```
No MongoDB? If `MONGO_URI` is not set, the server starts an in-memory MongoDB automatically.
To use a real DB (e.g. MongoDB Atlas): `MONGO_URI="mongodb+srv://..." npm run dev:server`.

## Production (single server)
```bash
npm run build && MONGO_URI="..." npm start   # Express serves client/dist on :5000
```

## The terrible features
1. **Add to Cart runs away** from the cursor; **Buy Now** clicks instantly. (Add to Cart gives up after 12 dodges.)
2. Search shows **"Searching the whole universe only for you…"** while typing and while loading.
3. **Cancel / Return** requires solving a hard **integration / differentiation CAPTCHA** (checked server-side; hint after 3 wrong tries).
4. Home categories: Special Birthday, Food, Travel, Summer Special.
5. Search loader shows **cats and dogs in goggles with shopping bags**.
6. Annoying popups: "Are you sure you want to look at this product?", "Congratulations! You have won absolutely nothing.", "Wait! Don't leave us…", and triple confirmation before adding to cart.
7. Footer: contact **Yourself**, the **user's own email**, location **Hell**.
8. Stare at a product for **30 seconds** → slap popup: **"Chal le le n bey!"**

## Product images

Each product shows `client/public/products/<slug>.jpg` (e.g. `helicopter.jpg`). To change a photo, drop in your own image with the same file name. If an image is missing, the product's emoji is shown instead. The included photos are from Wikimedia Commons; see `client/public/products/CREDITS.md`. `scripts/fetch-images.py` re-downloads them.

## API
| Method | Path | Notes |
|---|---|---|
| GET | `/api/categories` | categories with products |
| GET | `/api/products/:slug` | product details |
| GET | `/api/search?q=` | search (deliberately slow) |
| GET/POST/PATCH/DELETE | `/api/cart[/:id]` | cart, keyed by `x-client-id` header |
| POST/GET | `/api/orders` | place / list orders |
| POST | `/api/orders/:id/captcha` | get a calculus CAPTCHA (`action`: cancel/return) |
| POST | `/api/orders/:id/verify` | submit answer (`captchaId`, `answer`) |
