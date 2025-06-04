import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import { faker } from '@faker-js/faker';

// Load models
import Category from './models/Category.js';
import Supplier from './models/Supplier.js';
import Product from './models/Product.js';
import StockMovement from './models/StockMovement.js';
import Setting from './models/Setting.js';
import Kpi from './models/Kpi.js';
import AuditLog from './models/AuditLog.js';

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'.cyan.underline))
  .catch(err => {
    console.error(`Error: ${err.message}`.red.underline.bold);
    process.exit(1);
  });

// Generate random categories
const generateCategories = async () => {
  const categories = [
    { name: 'Electronics', description: 'Electronic devices and accessories' },
    { name: 'Office Supplies', description: 'Office stationery and supplies' },
    { name: 'Furniture', description: 'Office and home furniture' },
    { name: 'Kitchen Appliances', description: 'Kitchen tools and appliances' },
    { name: 'Computer Parts', description: 'Computer components and accessories' },
    { name: 'Cleaning Supplies', description: 'Cleaning products and tools' },
    { name: 'Medical Supplies', description: 'Healthcare and medical equipment' },
    { name: 'Tools', description: 'Hand and power tools' }
  ];

  return await Category.insertMany(categories);
};

// Generate random suppliers
const generateSuppliers = async () => {
  const suppliers = [];

  for (let i = 0; i < 10; i++) {
    const supplier = {
      name: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      city: faker.location.city(),
      company: faker.company.name(),
      contactPerson: faker.person.fullName(),
      paymentTerms: faker.helpers.arrayElement(['Net 30', 'Net 60', 'Net 90', 'Immediate'])
    };
    suppliers.push(supplier);
  }

  return await Supplier.insertMany(suppliers);
};

// Generate random products
const generateProducts = async (categories, suppliers) => {
  const products = [];

  // For each category, create several products
  for (const category of categories) {
    const numProducts = Math.floor(Math.random() * 5) + 3; // 3-7 products per category
    
    for (let i = 0; i < numProducts; i++) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      const price = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
      const currentQuantity = Math.floor(Math.random() * 100) + 1;
      const minimumStockLevel = Math.floor(Math.random() * 20) + 5;

      const product = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category: category._id,
        supplier: supplier._id,
        currentQuantity,
        minimumStockLevel,
        price,
        sku: faker.string.alphanumeric(8).toUpperCase(),
        expirationDate: faker.date.future()
      };
      
      products.push(product);
    }
  }

  return await Product.insertMany(products);
};

// Generate stock movements
const generateStockMovements = async (products) => {
  const stockMovements = [];

  // For each product, create some stock movements
  for (const product of products) {
    const numMovements = Math.floor(Math.random() * 5) + 2; // 2-6 movements per product
    
    // First movement is always an "in" movement for initial stock
    stockMovements.push({
      product: product._id,
      movementType: 'in',
      quantity: product.currentQuantity,
      reason: 'Initial Stock',
      movementDate: faker.date.past({ years: 1 })
    });
    
    // Generate additional random movements
    for (let i = 0; i < numMovements; i++) {
      const movementType = faker.helpers.arrayElement(['in', 'out']);
      const quantity = Math.floor(Math.random() * 20) + 1;
      
      // Generate appropriate reason based on movement type
      let reason;
      if (movementType === 'in') {
        reason = faker.helpers.arrayElement(['Purchase Order', 'Return', 'Adjustment', 'Transfer In']);
      } else {
        reason = faker.helpers.arrayElement(['Sale', 'Damage', 'Expiry', 'Transfer Out']);
      }
      
      stockMovements.push({
        product: product._id,
        movementType,
        quantity,
        reason,
        movementDate: faker.date.recent({ days: 30 })
      });
    }
  }

  return await StockMovement.insertMany(stockMovements);
};

// Generate settings
const generateSettings = async () => {
  const settings = {
    companyName: 'Inventory Pro',
    email: 'info@inventorypro.com',
    phone: '+1 (555) 123-4567',
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    currency: 'USD',
    lowStockThreshold: 10
  };

  return await Setting.insertMany([settings]);
};

// Generate KPIs
const generateKpis = async () => {
  const kpis = [
    {
      name: 'Total Products',
      value: 0,
      unit: 'count',
      description: 'Total number of products in inventory'
    },
    {
      name: 'Low Stock Items',
      value: 0,
      unit: 'count',
      description: 'Number of items below minimum stock level'
    },
    {
      name: 'Inventory Value',
      value: 0,
      unit: 'USD',
      description: 'Total value of current inventory'
    }
  ];

  return await Kpi.insertMany(kpis);
};

// Generate audit logs
const generateAuditLogs = async (products) => {
  // Since we need a user ID for audit logs and we don't want to create users,
  // let's create a temporary user ID (this won't be a real user in the system)
  const dummyUserId = new mongoose.Types.ObjectId();
  
  const auditLogs = [];
  
  // Create audit logs for product creation
  for (const product of products) {
    auditLogs.push({
      user: dummyUserId, // Required field
      action: 'create',
      entityType: 'product', // Must be lowercase to match enum
      entityId: product._id,
      description: `Created product: ${product.name}`, // Required field
      newValues: { 
        name: product.name,
        currentQuantity: product.currentQuantity,
        price: product.price
      }
    });
  }
  
  return await AuditLog.insertMany(auditLogs);
};

// Main function to seed data
const seedData = async () => {
  try {
    // Clear existing data
    await Category.deleteMany();
    await Supplier.deleteMany();
    await Product.deleteMany();
    await StockMovement.deleteMany();
    await Setting.deleteMany();
    await Kpi.deleteMany();
    await AuditLog.deleteMany();
    
    console.log('Data cleared...'.red.inverse);

    // Generate new data
    const categories = await generateCategories();
    console.log(`${categories.length} categories created...`.green);
    
    const suppliers = await generateSuppliers();
    console.log(`${suppliers.length} suppliers created...`.green);
    
    const products = await generateProducts(categories, suppliers);
    console.log(`${products.length} products created...`.green);
    
    const stockMovements = await generateStockMovements(products);
    console.log(`${stockMovements.length} stock movements created...`.green);
    
    const settings = await generateSettings();
    console.log(`Settings created...`.green);
    
    const kpis = await generateKpis();
    console.log(`${kpis.length} KPIs created...`.green);
    
    const auditLogs = await generateAuditLogs(products);
    console.log(`${auditLogs.length} audit logs created...`.green);

    console.log('Data seeded successfully!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

// Run the seed function
seedData();
