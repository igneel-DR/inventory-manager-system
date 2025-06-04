import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String, // Or use a custom ID generator if needed
      // For now, we can rely on MongoDB's _id or generate on client/service layer if needed
      // unique: true, 
      // required: [true, 'Product ID is required'],
      // trim: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier information is required'],
    },
    currentQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    minimumStockLevel: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock level cannot be negative'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    // unitPrice: { type: Number, default: 0 }, // For inventory valuation later
    // purchasePrice: { type: Number, default: 0 }, // For tracking costs
    expirationDate: { // This might be better handled at a batch/lot level for real-world scenarios
      type: Date,
    },
    // Add other fields like SKU, barcode, images array, etc. as needed
  },
  { timestamps: true }
);

// Index for faster searching on name
productSchema.index({ name: 'text', description: 'text' });

// Virtual for isLowStock
productSchema.virtual('isLowStock').get(function() {
  return this.currentQuantity < this.minimumStockLevel;
});

// Ensure virtuals are included when converting to JSON/object
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });


const Product = mongoose.model('Product', productSchema);

export default Product; 