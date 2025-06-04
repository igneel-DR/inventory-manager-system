import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'; // Import auth routes
import dashboardRoutes from './routes/dashboardRoutes.js'; // Import dashboard routes
import categoryRoutes from './routes/categoryRoutes.js'; // Import category routes
import supplierRoutes from './routes/supplierRoutes.js'; // Import supplier routes
import productRoutes from './routes/productRoutes.js';   // Import product routes
import userRoutes from './routes/userRoutes.js'; // Import user routes
import stockMovementRoutes from './routes/stockMovementRoutes.js'; // Import stock movement routes
import reportRoutes from './routes/reportRoutes.js'; // Import report routes
import settingRoutes from './routes/settingRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js'; // Import chatbot routes
//import kpiRoutes from './routes/kpiRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5001; // Default to 5001 if not specified in .env

// Middlewares
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// Define Routes
app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/dashboard', dashboardRoutes); // Mount dashboard routes
app.use('/api/categories', categoryRoutes);     // Mount category routes
app.use('/api/suppliers', supplierRoutes);       // Mount supplier routes
app.use('/api/products', productRoutes);         // Mount product routes
app.use('/api/users', userRoutes);             // Mount user routes
app.use('/api/stock-movements', stockMovementRoutes); // Mount stock movement routes
app.use('/api/reports', reportRoutes); // Mount report routes
app.use('/api/settings', settingRoutes); // Mount settings routes
app.use('/api/audit-logs', auditRoutes); // Mount audit logs routes
app.use('/api/chat', chatbotRoutes); // Mount chatbot routes at /chat instead of /api/chat
//app.use('/api/kpis', kpiRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('O.T.R.A FOOD DISTRIBUTION API is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 