import express from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', authController.loginUser);

// Authentication routes
router.get('/me', protect, authController.getMe);

// Profile management routes
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

export default router; 