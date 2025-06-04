import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js'; // Needed for validation
import Supplier from '../models/Supplier.js'; // Needed for validation
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Admin, Stock Manager)
router.post('/', protect, authorize('admin', 'stock_manager'), async (req, res) => {
  const {
    name, description, category: categoryId, supplier: supplierId, 
    initialQuantity, minimumStockLevel, expirationDate, productId, price
  } = req.body;

  try {
    // Validate category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryId || !categoryExists) {
      return res.status(400).json({ message: 'Invalid or missing category ID' });
    }

    // Validate supplier exists (if provided)
    if (supplierId) {
      const supplierExists = await Supplier.findById(supplierId);
      if (!supplierExists) {
        return res.status(400).json({ message: 'Invalid supplier ID' });
      }
    }
    
    // Optional: Check if product with the same name already exists
    // const productExists = await Product.findOne({ name });
    // if (productExists) {
    //   return res.status(400).json({ message: 'Product with this name already exists' });
    // }

    const product = new Product({
      name,
      description,
      category: categoryId,
      supplier: supplierId || undefined, // Set to undefined if not provided
      currentQuantity: initialQuantity || 0,
      minimumStockLevel: minimumStockLevel || 0,
      price: price,
      expirationDate,
      productId
    });

    const createdProduct = await product.save();
    // Populate category and supplier for the response
    const populatedProduct = await Product.findById(createdProduct._id).populate('category', 'name').populate('supplier', 'name companyName');
    res.status(201).json(populatedProduct);

  } catch (error) {
    console.error('Error creating product:', error.message);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/products
// @desc    Get all products (with populated category and supplier)
// @access  Private (All authenticated users)
router.get('/', protect, async (req, res) => {
  try {
    // TODO: Add pagination, filtering, sorting
    const products = await Product.find({})
      .populate('category', 'name') // Populate category name
      .populate('supplier', 'name companyName') // Populate supplier name and company
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/products/:id
// @desc    Get a single product by ID (with populated category and supplier)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description')
      .populate('supplier', 'name companyName email phone');
      
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Admin, Stock Manager)
router.put('/:id', protect, authorize('admin', 'stock_manager'), async (req, res) => {
  const {
    name, description, category: categoryId, supplier: supplierId,
    currentQuantity, minimumStockLevel, expirationDate, productId, price
  } = req.body;

  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate category if changed
    if (categoryId && categoryId.toString() !== product.category.toString()) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
      product.category = categoryId;
    } else if (categoryId === null || categoryId === '') { // Allow unsetting category if schema permits
        // product.category = undefined; // Or handle as per your schema requirements
        return res.status(400).json({ message: 'Category ID cannot be empty if provided' });
    }

    // Validate supplier if changed
    if (supplierId && (!product.supplier || supplierId.toString() !== product.supplier.toString())) {
      const supplierExists = await Supplier.findById(supplierId);
      if (!supplierExists) {
        return res.status(400).json({ message: 'Invalid supplier ID' });
      }
      product.supplier = supplierId;
    } else if (supplierId === null) { // Allow unsetting supplier
      product.supplier = undefined;
    }

    // Update fields
    product.name = name || product.name;
    product.description = description === undefined ? product.description : description;
    product.currentQuantity = currentQuantity === undefined ? product.currentQuantity : currentQuantity;
    product.minimumStockLevel = minimumStockLevel === undefined ? product.minimumStockLevel : minimumStockLevel;
    product.expirationDate = expirationDate === undefined ? product.expirationDate : expirationDate; 
    product.productId = productId === undefined ? product.productId : productId;
    product.price = price === undefined ? product.price : price;

    const updatedProduct = await product.save();
    // Populate for response
    const populatedProduct = await Product.findById(updatedProduct._id).populate('category', 'name').populate('supplier', 'name companyName');
    res.json(populatedProduct);

  } catch (error) {
    console.error('Error updating product:', error.message);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Admin, Stock Manager)
// TODO: Consider implications: if stock movements exist for this product, prevent deletion?
// Or archive the product instead of hard delete.
router.delete('/:id', protect, authorize('admin', 'stock_manager'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Basic check: prevent deletion if stock movements exist for this product
    // const movementCount = await StockMovement.countDocuments({ product: req.params.id });
    // if (movementCount > 0) {
    //   return res.status(400).json({ message: `Cannot delete product. It has ${movementCount} stock movements.` });
    // }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error.message);
     if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router; 