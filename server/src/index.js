import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Product, CartItem, Order } from './models.js';
import { seed, CATEGORIES } from './seed.js';
import { newChallenge, checkChallenge } from './captcha.js';

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const clientId = (req) => String(req.get('x-client-id') || 'anonymous').slice(0, 64);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

app.get('/api/categories', async (_req, res) => {
  const products = await Product.find().lean();
  res.json(CATEGORIES.map((c) => ({ ...c, products: products.filter((p) => p.category === c.key) })));
});

app.get('/api/products/:slug', async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug }).lean();
  if (!p) return res.status(404).json({ error: 'This product ran away. Like your ex.' });
  res.json(p);
});

app.get('/api/search', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100);
  await sleep(1500);
  const rx = new RegExp(escapeRegex(q), 'i');
  const results = q ? await Product.find({ $or: [{ name: rx }, { category: rx }, { description: rx }, { tagline: rx }] }).lean() : [];
  let fallback = [];
  if (!results.length) fallback = await Product.aggregate([{ $sample: { size: 3 } }]);
  res.json({ q, results, fallback });
});

async function cartFor(id) {
  const items = await CartItem.find({ clientId: id }).populate('product').lean();
  return items.filter((i) => i.product);
}

app.get('/api/cart', async (req, res) => res.json(await cartFor(clientId(req))));

app.post('/api/cart', async (req, res) => {
  const { productId, qty = 1 } = req.body || {};
  if (!mongoose.isValidObjectId(productId) || !(await Product.exists({ _id: productId }))) {
    return res.status(400).json({ error: 'Invalid product' });
  }
  const n = Math.max(1, Math.min(99, Number(qty) || 1));
  await CartItem.updateOne({ clientId: clientId(req), product: productId }, { $inc: { qty: n } }, { upsert: true });
  res.json(await cartFor(clientId(req)));
});

app.patch('/api/cart/:id', async (req, res) => {
  const qty = Math.max(1, Math.min(99, Number(req.body?.qty) || 1));
  if (mongoose.isValidObjectId(req.params.id)) {
    await CartItem.updateOne({ _id: req.params.id, clientId: clientId(req) }, { qty });
  }
  res.json(await cartFor(clientId(req)));
});

app.delete('/api/cart/:id', async (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    await CartItem.deleteOne({ _id: req.params.id, clientId: clientId(req) });
  }
  res.json(await cartFor(clientId(req)));
});

const SHIPPING = {
  pigeon: { label: 'Carrier Pigeon (3–7 years)', fee: 0, eta: 'Somewhere between now and 2097' },
  express: { label: 'Express (slower)', fee: 999, eta: 'Next Tuesday. Not this one. Not the one after.' },
  bullock: { label: 'Bullock Cart Prime', fee: 49, eta: 'When the bullock feels like it' },
};

app.post('/api/orders', async (req, res) => {
  const id = clientId(req);
  const { customer = {}, shipping = 'pigeon', payment = 'cod' } = req.body || {};
  if (!customer.name || !customer.email || !customer.address) return res.status(400).json({ error: 'Fill everything. Yes, everything.' });
  const ship = SHIPPING[shipping] || SHIPPING.pigeon;
  const cart = await cartFor(id);
  if (!cart.length) return res.status(400).json({ error: 'Your cart is empty. Like your promises.' });
  const items = cart.map((c) => ({ product: c.product._id, name: c.product.name, emoji: c.product.emoji, price: c.product.price, qty: c.qty }));
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const fees = [
    { label: `Shipping: ${ship.label}`, amount: ship.fee },
    { label: 'Convenience fee (for your inconvenience)', amount: 199 },
    { label: 'Fee fee', amount: 49 },
    { label: 'Breathing tax', amount: 21 },
    { label: 'Discount you were never going to get', amount: 0 },
  ];
  const total = subtotal + fees.reduce((s, f) => s + f.amount, 0);
  const order = await Order.create({
    clientId: id, items, fees, total, shipping: ship.label, payment, eta: ship.eta,
    customer: { name: String(customer.name).slice(0, 80), email: String(customer.email).slice(0, 120), address: String(customer.address).slice(0, 300) },
  });
  await CartItem.deleteMany({ clientId: id });
  res.json(order);
});

app.get('/api/orders', async (req, res) => {
  res.json(await Order.find({ clientId: clientId(req) }).sort({ createdAt: -1 }).lean());
});

async function ownedOrder(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) { res.status(404).json({ error: 'Order not found' }); return null; }
  const order = await Order.findOne({ _id: req.params.id, clientId: clientId(req) });
  if (!order) { res.status(404).json({ error: 'Order not found' }); return null; }
  if (order.status !== 'placed') { res.status(400).json({ error: `Already ${order.status}. Let it go.` }); return null; }
  return order;
}

app.post('/api/orders/:id/captcha', async (req, res) => {
  const action = req.body?.action === 'return' ? 'return' : 'cancel';
  const order = await ownedOrder(req, res);
  if (!order) return;
  res.json(newChallenge(String(order._id), action));
});

app.post('/api/orders/:id/verify', async (req, res) => {
  const order = await ownedOrder(req, res);
  if (!order) return;
  const result = checkChallenge(req.body?.captchaId, String(order._id), req.body?.answer);
  if (result.ok) {
    order.status = result.action === 'return' ? 'returned' : 'cancelled';
    await order.save();
    return res.json({ ok: true, order });
  }
  res.json(result);
});

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

async function start() {
  let uri = process.env.MONGO_URI;
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'kharabkart',
      },
      binary: {
        version: '7.0.14',
      },
    });
    uri = mem.getUri();
    console.log('No MONGO_URI set, using in-memory MongoDB');
  }
  await mongoose.connect(uri);
  await seed();
  app.listen(PORT, () => console.log(`KharabKart API on http://localhost:${PORT}`));
}

start().catch((e) => { console.error(e); process.exit(1); });
