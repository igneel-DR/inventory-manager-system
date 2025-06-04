import express from 'express';
const router = express.Router();
import { getAuditLogs } from '../controllers/auditController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Get audit logs - Restricted to Admin users
router.get('/', protect, authorize('admin'), getAuditLogs);

export default router; 