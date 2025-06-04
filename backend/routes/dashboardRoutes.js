import express from 'express';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming authorize is not needed for all dashboard KPIs by default

const router = express.Router();

// @route   GET /api/dashboard/kpis
// @desc    Get key performance indicators for the dashboard
// @access  Private (all authenticated users)
router.get('/kpis', protect, async (req, res) => {
  try {
    // 1. Total number of products
    const totalProducts = await Product.countDocuments();

    // 2. Total stock quantity across all products
    const totalStockQuantityAggregate = await Product.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$currentQuantity' } } },
    ]);
    const totalStockQuantity = totalStockQuantityAggregate.length > 0 ? totalStockQuantityAggregate[0].totalQuantity : 0;

    // 3. Low stock products count and items
    // Using the virtual field requires fetching documents or a more complex aggregation if done purely in DB
    const products = await Product.find({}); // Fetch all products
    const lowStockProducts = products.filter(p => p.isLowStock);
    const lowStockProductsCount = lowStockProducts.length;
    
    // Get detailed information for low stock items
    const lowStockItems = lowStockProducts.map(p => ({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      quantity: p.currentQuantity,
      minimumLevel: p.minimumStockLevel
    }));

    // 4. Daily stock movement summary (for today)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const dailyMovements = await StockMovement.aggregate([
      { $match: { movementDate: { $gte: todayStart, $lte: todayEnd } } },
      {
        $group: {
          _id: '$movementType',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 5. Weekly stock movement summary (for the current week, Mon-Sun)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weeklyMovements = await StockMovement.aggregate([
      { $match: { movementDate: { $gte: weekStart, $lte: weekEnd } } },
      {
        $group: {
          _id: '$movementType',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      }
    ]);

    // 6. Additional data for Admin dashboard (user counts)
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminCount = await User.countDocuments({ role: 'admin' });

    res.json({
      totalProducts,
      totalStockQuantity,
      lowStockProductsCount,
      lowStockItems,
      dailyMovements, // Format: [{ _id: 'in', totalQuantity: X, count: Y}, {_id: 'out', ...}]
      weeklyMovements,
      activeUsers,
      adminCount
    });

  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/dashboard/charts/stock-movements
// @desc    Get stock movement data for charts (last 7 days)
// @access  Private (all authenticated users)
router.get('/charts/stock-movements', protect, async (req, res) => {
  try {
    // Always include today's date in the chart
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6); // Last 7 days including today
    startDate.setHours(0, 0, 0, 0);
    
    
    // Find all stock movements in this date range
    const movements = await StockMovement.find({
      movementDate: { $gte: startDate, $lte: today }
    }).sort({ movementDate: 1 });
    
    
    // Group movements by date and type using aggregation
    const dailyMovements = await StockMovement.aggregate([
      { 
        $match: { 
          movementDate: { $gte: startDate, $lte: today } 
        } 
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$movementDate" } },
            type: "$movementType"
          },
          totalQuantity: { $sum: "$quantity" }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);
      
    // Generate all dates in the 7-day range
    const dateLabels = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dateLabels.push(dateStr);
    }
    
    // Make sure today's date is included
    const todayStr = today.toISOString().split('T')[0];
    if (!dateLabels.includes(todayStr)) {
      dateLabels.pop(); // Remove earliest date
      dateLabels.push(todayStr); // Add today
      dateLabels.sort(); // Keep sorted
    }
        
    // Transform data for chart consumption
    const stockInData = [];
    const stockOutData = [];
    
    // Fill data for each date in our range
    for (const dateStr of dateLabels) {
      // Find data for this date, or default to 0
      const inMovement = dailyMovements.find(m => 
        m._id.date === dateStr && m._id.type === 'in'
      );
      const outMovement = dailyMovements.find(m => 
        m._id.date === dateStr && m._id.type === 'out'
      );
      
      stockInData.push(inMovement ? inMovement.totalQuantity : 0);
      stockOutData.push(outMovement ? outMovement.totalQuantity : 0);
    }
        
    res.json({
      labels: dateLabels,
      datasets: [
        {
          label: 'Stock In',
          data: stockInData
        },
        {
          label: 'Stock Out',
          data: stockOutData
        }
      ]
    });
    
  } catch (error) {
    console.error('Error fetching chart data:', error.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/dashboard/charts/inventory-value
// @desc    Get inventory value over time (last 30 days)
// @access  Private (accountants and admins)
router.get('/charts/inventory-value', protect, async (req, res) => {
  // Only allow admins and accountants
  if (req.user.role !== 'admin' && req.user.role !== 'accountant') {
    return res.status(403).json({ message: 'Unauthorized - Requires admin or accountant role' });
  }
  
  try {
    // For a real implementation, you would need a historical inventory value table
    // For now, we'll generate mock data based on current inventory
    
    const totalProducts = await Product.countDocuments();
    const productsWithValue = await Product.find().select('currentQuantity price');
    
    // Calculate current total value
    const totalValue = productsWithValue.reduce((sum, product) => {
      return sum + (product.currentQuantity * product.price);
    }, 0);
    
    // Generate mock historical data - ensure today is included
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 29); // Last 30 days including today
    startDate.setHours(0, 0, 0, 0);
        
    const dateLabels = [];
    const valueData = [];
    
    // Generate a semi-realistic trend with some randomness
    let currentValue = totalValue * 0.9; // Start slightly lower than current
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dateLabels.push(dateStr);
      
      // Add some randomness to the trend
      const randomFactor = 0.98 + Math.random() * 0.04; // 0.98 to 1.02
      currentValue = currentValue * randomFactor;
      
      // Make sure final day is exact current value
      if (i === 29) {
        valueData.push(totalValue);
      } else {
        valueData.push(Number(currentValue.toFixed(2)));
      }
    }
    
    // Ensure today's date is in the labels
    const todayStr = today.toISOString().split('T')[0];
    if (!dateLabels.includes(todayStr)) {
      // Replace the last label with today
      dateLabels[dateLabels.length - 1] = todayStr;
    }
        
    res.json({
      labels: dateLabels,
      datasets: [
        {
          label: 'Inventory Value ($)',
          data: valueData
        }
      ]
    });
    
  } catch (error) {
    console.error('Error fetching inventory value chart:', error.message);
    res.status(500).send('Server error');
  }
});

export default router; 