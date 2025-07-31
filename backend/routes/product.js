import express from 'express';
import { createProduct, getProducts, getProductById, deleteProduct, updateProduct } from '../controllers/productController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, isAdmin, upload.single('image'), createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', protect, isAdmin, upload.single('image'), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);

export default router; 