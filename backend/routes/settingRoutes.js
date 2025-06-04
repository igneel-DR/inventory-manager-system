import express from 'express';
const router = express.Router();
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Get settings - Available to all authenticated users
router.get('/', protect, getSettings);

// Update settings - Restricted to Admin users only
router.put('/', protect, authorize('admin'), updateSettings);

export default router; 