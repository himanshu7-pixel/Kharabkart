import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({ user: String, stars: Number, text: String }, { _id: false });

export const Product = mongoose.model('Product', new mongoose.Schema({
  slug: { type: String, unique: true },
  name: String,
  category: String,
  emoji: String,
  price: Number,
  mrp: Number,
  description: String,
  tagline: String,
  reviews: [reviewSchema],
}));

export const CartItem = mongoose.model('CartItem', new mongoose.Schema({
  clientId: { type: String, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  qty: { type: Number, default: 1 },
}));

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String, emoji: String, price: Number, qty: Number,
}, { _id: false });

export const Order = mongoose.model('Order', new mongoose.Schema({
  clientId: { type: String, index: true },
  items: [orderItemSchema],
  customer: { name: String, email: String, address: String },
  shipping: String,
  payment: String,
  fees: [{ label: String, amount: Number, _id: false }],
  total: Number,
  eta: String,
  status: { type: String, enum: ['placed', 'cancelled', 'returned'], default: 'placed' },
}, { timestamps: true }));
