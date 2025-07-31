import Product from '../models/Product.js';
import Category from '../models/Category.js';

export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    const image = req.file ? req.file.path : null;
    
    if (!image) {
      return res.status(400).json({ message: 'Product image is required' });
    }
    
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    const product = new Product({ 
      name, 
      price, 
      description, 
      image: image.replace(/\\/g, '/'), 
      category 
    });
    await product.save();
    
    const populatedProduct = await Product.findById(product._id).populate('category', 'categoryName');
    res.status(201).json(populatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { category, sort, search, page = 1, limit = 32 } = req.query;
    let query = {};
    let sortOption = {};
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Search by product name or description if provided
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    
    // Sort by price if provided
    if (sort === 'price-asc') {
      sortOption.price = 1;
    } else if (sort === 'price-desc') {
      sortOption.price = -1;
    } else {
      sortOption.createdAt = -1; // Default sort by newest first
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limitNum);
    
    const products = await Product.find(query)
      .populate('category', 'categoryName')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
    
    res.json({
      products,
      currentPage: pageNum,
      totalPages,
      totalProducts,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('category', 'categoryName');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category } = req.body;
    const image = req.file ? req.file.path : null;
    
    let updateFields = { name, price, description };
    if (image) {
      updateFields.image = image.replace(/\\/g, '/');
    }
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
      updateFields.category = category;
    }
    
    const product = await Product.findByIdAndUpdate(
      id, 
      updateFields, 
      { new: true, runValidators: true }
    ).populate('category', 'categoryName');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 