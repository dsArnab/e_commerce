import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';

const router = express.Router();
console.log('Stripe Key:', process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe('process.env.STRIPE_SECRET_KEY');

router.post('/create-intent', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Order already paid or processed' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe expects amount in cents
      currency: 'usd',
      metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router; 