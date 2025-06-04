import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required for stock movement'],
    },
    movementType: {
      type: String,
      enum: ['in', 'out'],
      required: [true, 'Movement type (in/out) is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Movement quantity must be at least 1'],
    },
    reason: {
      // e.g., 'Initial Stock', 'Sale', 'Purchase Order', 'Adjustment - Damage', 'Transfer'
      type: String,
      trim: true,
    },
    // relatedOrder: { type: String }, // Could be Sales Order ID, Purchase Order ID etc.
    // batchOrLotNumber: { type: String }, // For traceability
    // expirationDate: { type: Date }, // If tracking expiry at movement level
    movementDate: {
      type: Date,
      default: Date.now,
    },
    // user: { // User who performed/authorized the movement
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true
    // },
  },
  { timestamps: true }
);

stockMovementSchema.index({ product: 1, movementDate: -1 }); // For quick lookup of product movements by date

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

export default StockMovement; 