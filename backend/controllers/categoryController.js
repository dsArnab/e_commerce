import Category from '../models/Category.js';

export const createCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;
    const image = req.file ? req.file.path : null;
    
    if (!image) {
      return res.status(400).json({ message: 'Category image is required' });
    }
    
    const existing = await Category.findOne({ categoryName });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const category = new Category({ 
      categoryName, 
      image: image.replace(/\\/g, '/'), // Normalize path for cross-platform compatibility
      description 
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description } = req.body;
    const image = req.file ? req.file.path : null;
    
    const updateData = { categoryName, description };
    if (image) {
      updateData.image = image.replace(/\\/g, '/');
    }
    
    const category = await Category.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 