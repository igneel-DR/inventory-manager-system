import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import StockMovement from '../models/StockMovement.js';
import Kpi from '../models/Kpi.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Capture KPI snapshot
const captureKpiSnapshot = async () => {
  try {
    console.log('Starting KPI snapshot capture...');
    
    // Get today's date (set to beginning of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 1. Total number of products
    const totalProducts = await Product.countDocuments();
    console.log(`Total products: ${totalProducts}`);

    // 2. Total stock quantity across all products
    const totalStockQuantityAggregate = await Product.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$currentQuantity' } } },
    ]);
    const totalStockQuantity = totalStockQuantityAggregate.length > 0 
      ? totalStockQuantityAggregate[0].totalQuantity 
      : 0;
    console.log(`Total stock quantity: ${totalStockQuantity}`);

    // 3. Low stock products count
    const products = await Product.find();
    const lowStockProductsCount = products.filter(p => p.isLowStock).length;
    console.log(`Low stock products count: ${lowStockProductsCount}`);

    // 4. Inventory value
    const productsWithValue = await Product.find().select('currentQuantity price');
    const totalInventoryValue = productsWithValue.reduce((sum, product) => {
      return sum + (product.currentQuantity * product.price);
    }, 0);
    console.log(`Total inventory value: ${totalInventoryValue}`);

    // 5. Daily stock movements (for today)
    const todayStart = new Date(today);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const dailyMovementsAggregate = await StockMovement.aggregate([
      { $match: { movementDate: { $gte: todayStart, $lte: todayEnd } } },
      {
        $group: {
          _id: '$movementType',
          totalQuantity: { $sum: '$quantity' },
        }
      }
    ]);

    const dailyStockIn = dailyMovementsAggregate.find(m => m._id === 'in')?.totalQuantity || 0;
    const dailyStockOut = dailyMovementsAggregate.find(m => m._id === 'out')?.totalQuantity || 0;
    console.log(`Daily stock in: ${dailyStockIn}, stock out: ${dailyStockOut}`);

    // 6. Active users
    const activeUsers = await User.countDocuments({ isActive: true });
    console.log(`Active users: ${activeUsers}`);

    // Create and save KPI snapshot
    const kpiSnapshot = new Kpi({
      date: today,
      totalProducts,
      totalStockQuantity,
      lowStockProductsCount,
      totalInventoryValue,
      dailyStockIn,
      dailyStockOut,
      activeUsers,
      snapshot: true
    });

    await kpiSnapshot.save();
    console.log('KPI snapshot saved successfully!');

  } catch (error) {
    console.error('Error capturing KPI snapshot:', error);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await captureKpiSnapshot();
  console.log('KPI snapshot process completed');
  process.exit(0);
};

// Execute the script
main(); 