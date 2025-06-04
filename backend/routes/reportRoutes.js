import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import mongoose from 'mongoose';

const router = express.Router();

// Protect all routes
router.use(protect);

// @desc    Get low stock products
// @route   GET /api/reports/low-stock
// @access  Private
router.get('/low-stock', async (req, res) => {
  try {
    const { category, supplier, search } = req.query;
    
    // Build query
    let query = {};
    
    // Add isLowStock condition - products where currentQuantity < minimumStockLevel
    query.$expr = { $lt: ["$currentQuantity", "$minimumStockLevel"] };
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = mongoose.Types.ObjectId(category);
    }
    
    // Add supplier filter
    if (supplier && supplier !== 'all') {
      query.supplier = mongoose.Types.ObjectId(supplier);
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get low stock products
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ currentQuantity: 1 }); // Sort by quantity ascending
    
    // Format response
    const formattedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      category: product.category?.name || 'Uncategorized',
      supplier: product.supplier?.name || 'Unknown',
      currentQuantity: product.currentQuantity,
      minimumStockLevel: product.minimumStockLevel,
      deficit: product.minimumStockLevel - product.currentQuantity
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get expired and near-expiry products
// @route   GET /api/reports/expiry
// @access  Private
router.get('/expiry', async (req, res) => {
  try {
    const { category, supplier, search, daysThreshold = 30 } = req.query;
    
    // Set the date threshold (default: 30 days from now)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + parseInt(daysThreshold));
    
    // Build query
    let query = {
      expirationDate: { $ne: null, $lte: thresholdDate }
    };
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = mongoose.Types.ObjectId(category);
    }
    
    // Add supplier filter
    if (supplier && supplier !== 'all') {
      query.supplier = mongoose.Types.ObjectId(supplier);
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get expiring products
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ expirationDate: 1 }); // Sort by expiration date ascending
    
    const now = new Date();
    
    // Format response
    const formattedProducts = products.map(product => {
      const expirationDate = new Date(product.expirationDate);
      const daysUntilExpiry = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
      
      return {
        id: product._id,
        name: product.name,
        category: product.category?.name || 'Uncategorized',
        supplier: product.supplier?.name || 'Unknown',
        expirationDate: product.expirationDate,
        daysUntilExpiry: daysUntilExpiry,
        quantity: product.currentQuantity,
        status: daysUntilExpiry <= 0 ? 'expired' : 'expiring'
      };
    });
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching expiring products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get product movements
// @route   GET /api/reports/movements
// @access  Private
router.get('/movements', async (req, res) => {
  try {
    const { startDate, endDate, category, supplier, search } = req.query;
    
    // Build query
    let query = {};
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999); // End of the day
        query.date.$lte = endDateObj;
      }
    }
    
    // Build product lookup pipeline for category and supplier filters
    let productLookupMatch = {};
    
    if (category && category !== 'all') {
      productLookupMatch.category = mongoose.Types.ObjectId(category);
    }
    
    if (supplier && supplier !== 'all') {
      productLookupMatch.supplier = mongoose.Types.ObjectId(supplier);
    }
    
    if (search) {
      productLookupMatch.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Aggregate pipeline
    const movements = await StockMovement.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $match: Object.keys(productLookupMatch).length > 0 ? 
          { 'productDetails': { $elemMatch: productLookupMatch } } : {}
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          date: 1,
          type: 1,
          quantity: 1,
          notes: 1,
          'productName': '$productDetails.name',
          'userName': { $ifNull: ['$userDetails.name', 'System'] }
        }
      },
      { $sort: { date: -1 } }
    ]);
    
    // Format response
    const formattedMovements = movements.map(movement => ({
      id: movement._id,
      date: movement.date,
      productName: movement.productName,
      type: movement.type,
      quantity: movement.quantity,
      user: movement.userName,
      notes: movement.notes
    }));
    
    res.json(formattedMovements);
  } catch (error) {
    console.error('Error fetching product movements:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get inventory valuation
// @route   GET /api/reports/inventory-valuation
// @access  Private
router.get('/inventory-valuation', async (req, res) => {
  try {
    const { category, supplier, search } = req.query;
    
    // Build query
    let query = {};
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = mongoose.Types.ObjectId(category);
    }
    
    // Add supplier filter
    if (supplier && supplier !== 'all') {
      query.supplier = mongoose.Types.ObjectId(supplier);
    }
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get products for valuation
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ name: 1 });
    
    // Calculate total inventory value
    let totalInventoryValue = 0;
    
    // Format response
    const formattedProducts = products.map(product => {
      // Use price as unit price, default to 0 if not set
      const unitPrice = product.price || 0;
      const totalValue = product.currentQuantity * unitPrice;
      
      // Add to total inventory value
      totalInventoryValue += totalValue;
      
      return {
        id: product._id,
        name: product.name,
        category: product.category?.name || 'Uncategorized',
        supplier: product.supplier?.name || 'Unknown',
        quantity: product.currentQuantity,
        unitPrice: unitPrice,
        totalValue: totalValue
      };
    });
    
    res.json({
      products: formattedProducts,
      summary: {
        totalProducts: products.length,
        totalItems: products.reduce((sum, product) => sum + product.currentQuantity, 0),
        totalValue: totalInventoryValue
      }
    });
  } catch (error) {
    console.error('Error fetching inventory valuation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get sales report (assuming stock-out movements are sales)
// @route   GET /api/reports/sales
// @access  Private
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate, category, supplier, search } = req.query;
    
    // Build query - only get stock-out movements (sales)
    let query = {
      type: 'out'
    };
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999); // End of the day
        query.date.$lte = endDateObj;
      }
    }
    
    // Build product lookup pipeline for category and supplier filters
    let productLookupMatch = {};
    
    if (category && category !== 'all') {
      productLookupMatch.category = mongoose.Types.ObjectId(category);
    }
    
    if (supplier && supplier !== 'all') {
      productLookupMatch.supplier = mongoose.Types.ObjectId(supplier);
    }
    
    if (search) {
      productLookupMatch.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Aggregate pipeline
    const sales = await StockMovement.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $match: Object.keys(productLookupMatch).length > 0 ? 
          { 'productDetails': { $elemMatch: productLookupMatch } } : {}
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          date: 1,
          quantity: 1,
          notes: 1,
          'productName': '$productDetails.name',
          'unitPrice': { $ifNull: ['$productDetails.price', 0] },
          'totalAmount': { $multiply: ['$quantity', { $ifNull: ['$productDetails.price', 0] }] },
          'userName': { $ifNull: ['$userDetails.name', 'System'] },
          'customer': { $ifNull: ['$reference', 'Walk-in Customer'] }
        }
      },
      { $sort: { date: -1 } }
    ]);
    
    // Calculate summary
    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    // Format response
    const formattedSales = sales.map(sale => ({
      id: sale._id,
      date: sale.date,
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalAmount: sale.totalAmount,
      user: sale.userName,
      customer: sale.customer,
      notes: sale.notes
    }));
    
    res.json({
      sales: formattedSales,
      summary: {
        totalTransactions: sales.length,
        totalItems: totalItems,
        totalRevenue: totalSales
      }
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 