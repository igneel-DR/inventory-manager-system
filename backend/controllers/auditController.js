import AuditLog from '../models/AuditLog.js';

// Get audit logs with pagination and filters
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Build filter object based on query parameters
    const filter = {};
    
    if (req.query.userId) {
      filter.user = req.query.userId;
    }
    
    if (req.query.action) {
      filter.action = req.query.action;
    }
    
    if (req.query.entityType) {
      filter.entityType = req.query.entityType;
    }
    
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      filter.createdAt = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      filter.createdAt = { $lte: new Date(req.query.endDate) };
    }
    
    // Search in description
    if (req.query.search) {
      filter.description = { $regex: req.query.search, $options: 'i' };
    }
    
    // Get logs with pagination
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .lean();
    
    // Get total count for pagination
    const total = await AuditLog.countDocuments(filter);
    
    return res.status(200).json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return res.status(500).json({ message: 'Error retrieving audit logs' });
  }
};

// Create a new audit log entry (used internally, not as API endpoint)
const createAuditLog = async (logData) => {
  try {
    return await AuditLog.create(logData);
  } catch (error) {
    console.error('Error creating audit log:', error);
    return null;
  }
};

export {
  getAuditLogs,
  createAuditLog,
}; 