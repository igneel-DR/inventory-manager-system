import mongoose from 'mongoose';

const kpiSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalStockQuantity: {
      type: Number,
      default: 0,
    },
    lowStockProductsCount: {
      type: Number,
      default: 0,
    },
    totalInventoryValue: {
      type: Number, // In cents/smallest currency unit to avoid floating point issues
      default: 0,
    },
    dailyStockIn: {
      type: Number,
      default: 0,
    },
    dailyStockOut: {
      type: Number,
      default: 0,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    snapshot: {
      type: Boolean,
      default: true, // Indicates this is a snapshot record, not realtime
    }
  },
  { timestamps: true }
);

// Create a compound index on date for historical queries
kpiSchema.index({ date: -1 });

const Kpi = mongoose.model('Kpi', kpiSchema);

export default Kpi; 