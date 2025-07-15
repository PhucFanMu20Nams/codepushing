const mongoose = require('mongoose');

const categoryConfigSchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    enum: ['Clothes', 'Footwear', 'Accessories'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  availableFields: {
    brands: [{
      type: String,
      trim: true
    }],
    types: [{
      type: String,
      trim: true
    }],
    colors: [{
      type: String,
      trim: true
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance (remove duplicate categoryName index since it's already unique)
categoryConfigSchema.index({ isActive: 1 });

// Pre-save middleware to update the updatedAt field
categoryConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance methods
categoryConfigSchema.methods.addOption = function(field, option) {
  if (!this.availableFields[field]) {
    throw new Error(`Invalid field: ${field}`);
  }
  
  // Check if option already exists (case-insensitive)
  const existingOption = this.availableFields[field].find(
    item => item.toLowerCase() === option.toLowerCase()
  );
  
  if (!existingOption) {
    this.availableFields[field].push(option);
    this.markModified(`availableFields.${field}`);
  }
  
  return this;
};

categoryConfigSchema.methods.removeOption = function(field, option) {
  if (!this.availableFields[field]) {
    throw new Error(`Invalid field: ${field}`);
  }
  
  this.availableFields[field] = this.availableFields[field].filter(
    item => item.toLowerCase() !== option.toLowerCase()
  );
  this.markModified(`availableFields.${field}`);
  
  return this;
};

categoryConfigSchema.methods.getFieldOptions = function(field) {
  return this.availableFields[field] || [];
};

// Static methods
categoryConfigSchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ categoryName: 1 });
};

categoryConfigSchema.statics.getCategoryOptions = function(categoryName) {
  return this.findOne({ 
    categoryName: categoryName, 
    isActive: true 
  });
};

const CategoryConfig = mongoose.model('CategoryConfig', categoryConfigSchema);

module.exports = CategoryConfig;
