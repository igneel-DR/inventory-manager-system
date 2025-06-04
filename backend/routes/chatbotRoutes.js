import express from 'express';
import { processQuery, getQueryHistory, clearQueryHistory } from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected by auth middleware
router.use(protect);

// Routes for inventory natural language queries
router.post('/query', processQuery);
router.get('/history', getQueryHistory);
router.delete('/history', clearQueryHistory);

export default router; 