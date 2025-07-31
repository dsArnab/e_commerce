import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Address from '../models/Address.js';
import Product from '../models/Product.js';

export const placeOrder = async (req, res) => {
  try {
    const { addressId } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) {
      return res.status(400).json({ message: 'Invalid address' });
    }
    let total = 0;
    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });
    const order = new Order({
      user: req.user._id,
      address: addressId,
      items: cart.items.map(item => ({ product: item.product._id, quantity: item.quantity })),
      total,
    });
    await order.save();
    cart.items = [];
    await cart.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 32 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    let query = {};
    if (req.user.role === 'admin') {
      // no filter
    } else {
      query.user = req.user._id;
    }
    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limitNum);
    const orders = await Order.find(query)
      .populate('user', 'firstname lastname email')
      .populate('address')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    res.json({
      orders,
      currentPage: pageNum,
      totalPages,
      totalOrders,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('address').populate('items.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (req.user.role !== 'admin' && !order.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 