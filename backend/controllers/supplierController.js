import Supplier from '../models/Supplier.js';

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    // Add query filtering for active/inactive if needed
    const isActive = req.query.isActive === 'false' ? false : true;
    
    const query = { isActive };
    
    // Add search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex },
        { city: searchRegex }
      ];
    }
    
    const suppliers = await Supplier.find(query).sort({ name: 1 });
    
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new supplier
// @route   POST /api/suppliers
// @access  Private
const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, city, company, contactPerson, paymentTerms } = req.body;
    
    // Check if supplier with this email already exists
    const existingSupplier = await Supplier.findOne({ email });
    if (existingSupplier) {
      return res.status(400).json({ message: 'Supplier with this email already exists' });
    }
    
    const supplier = await Supplier.create({
      name,
      email,
      phone,
      city,
      company,
      contactPerson,
      paymentTerms
    });
    
    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error.message);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = async (req, res) => {
  try {
    const { name, email, phone, city, company, contactPerson, paymentTerms, isActive } = req.body;
    
    // Find the supplier first
    let supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    // If email is being changed, check if it's already in use
    if (email !== supplier.email) {
      const existingSupplier = await Supplier.findOne({ email });
      if (existingSupplier) {
        return res.status(400).json({ message: 'Supplier with this email already exists' });
      }
    }
    
    // Update fields
    supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        city,
        company,
        contactPerson,
        paymentTerms,
        isActive: isActive !== undefined ? isActive : supplier.isActive
      },
      { new: true, runValidators: true }
    );
    
    res.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a supplier (soft delete by setting isActive to false)
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    // Soft delete (set isActive to false)
    await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    res.json({ message: 'Supplier removed' });
  } catch (error) {
    console.error('Error removing supplier:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
}; 