import express from 'express';
const router = express.Router();
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js'; 
import { protect, authorize } from '../middleware/authMiddleware.js';

router.route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/:id')
  .get(protect, authorize('admin'), getUserById) 
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

export default router; 