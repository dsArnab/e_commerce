import express from 'express';
import { createCategory, getCategories, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, isAdmin, upload.single('image'), createCategory);
router.get('/', getCategories);
router.put('/:id', protect, isAdmin, upload.single('image'), updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

export default router; 