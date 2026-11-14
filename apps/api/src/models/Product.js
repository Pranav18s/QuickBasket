const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '', maxlength: 2000 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    categorySlug: { type: String, required: true, trim: true, maxlength: 80 },
    pricePaise: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    comparePricePaise: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
    packageSize: { type: String, required: true, trim: true, maxlength: 80 },
    stock: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
    image: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ categorySlug: 1, active: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
