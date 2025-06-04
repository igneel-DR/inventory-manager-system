import express from 'express';
import StockMovement from '../models/StockMovement.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/stock-movements
// @desc    Get all stock movements with optional filtering
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { product, type, startDate, endDate } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (product) {
      filter.product = product;
    }
    
    if (type && ['in', 'out'].includes(type)) {
      filter.movementType = type;
    }
    
    // Date filtering
    if (startDate || endDate) {
      filter.movementDate = {};
      if (startDate) {
        filter.movementDate.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set time to end of day for end date
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.movementDate.$lte = endDateTime;
      }
    }
    
    const stockMovements = await StockMovement.find(filter)
      .populate('product', 'name productId')
      .sort({ movementDate: -1 });
      
    res.json(stockMovements);
  } catch (error) {
    console.error('Error fetching stock movements:', error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/stock-movements
// @desc    Create a new stock movement
// @access  Private (Admin, Stock Manager)
router.post('/', protect, authorize('admin', 'stock_manager'), async (req, res) => {
  const { product: productId, movementType, quantity, reason, movementDate } = req.body;
  
  try {
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: 'Product not found' });
    }
    
    // Validate quantity is positive
    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }
    
    // For 'out' movements, check if there's enough stock
    if (movementType === 'out' && product.currentQuantity < quantityNum) {
      return res.status(400).json({ 
        message: `Insufficient stock. Current quantity is ${product.currentQuantity}.` 
      });
    }
    
    // Create stock movement
    const stockMovement = new StockMovement({
      product: productId,
      movementType,
      quantity: quantityNum,
      reason: reason || undefined,
      movementDate: movementDate ? new Date(movementDate) : new Date()
    });
    
    // Update product quantity
    if (movementType === 'in') {
      product.currentQuantity += quantityNum;
    } else {
      product.currentQuantity -= quantityNum;
    }
    
    // Save both the movement and updated product
    await Promise.all([
      stockMovement.save(),
      product.save()
    ]);
    
    // Populate product details for response
    const populatedMovement = await StockMovement.findById(stockMovement._id)
      .populate('product', 'name productId');
      
    res.status(201).json(populatedMovement);
    
  } catch (error) {
    console.error('Error creating stock movement:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/stock-movements/product/:productId
// @desc    Get stock movements for a specific product
// @access  Private
router.get('/product/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10 } = req.query;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const stockMovements = await StockMovement.find({ product: productId })
      .sort({ movementDate: -1 })
      .limit(parseInt(limit));
      
    res.json(stockMovements);
  } catch (error) {
    console.error('Error fetching product stock movements:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router; 