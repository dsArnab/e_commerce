import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category; 