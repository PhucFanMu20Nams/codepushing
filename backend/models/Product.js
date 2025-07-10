const mongoose = require('mongoose');

// Define Product Schema for MongoDB
const ProductSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: false,
    index: true // Index this field for faster lookups
  },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subcategory: String,
  type: String,
  color: String,
  style: String,
  imageUrl: String,
  image: String,
  // Update these to handle objects instead of just strings
  gallery: { type: mongoose.Schema.Types.Mixed, default: [] },
  sizes: { type: mongoose.Schema.Types.Mixed, default: [] },
  details: { type: mongoose.Schema.Types.Mixed, default: [] },
  description: String,
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Product', ProductSchema);
