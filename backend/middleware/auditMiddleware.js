const AuditLog = require('../models/AuditLog');

/**
 * Middleware to create an audit log entry
 * @param {string} action - The action performed (CREATE, READ, UPDATE, DELETE)
 * @param {string} entityType - Type of entity (product, user, category, etc.)
 * @param {string} description - Description of the action
 */
const createAuditLog = (action, entityType, description) => {
  return async (req, res, next) => {
    // Store the original send function
    const originalSend = res.send;
    
    // Override the send function to log audit after successful responses
    res.send = function(body) {
      // Only log if response is successful (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        let entityId = null;
        let newValues = null;
        
        // Extract entity ID and values based on the request or response
        try {
          // For POST requests (create)
          if (req.method === 'POST' && action === 'CREATE') {
            const data = typeof body === 'string' ? JSON.parse(body) : body;
            if (data._id) {
              entityId = data._id;
              newValues = data;
            }
          } 
          // For PUT/PATCH requests (update)
          else if ((req.method === 'PUT' || req.method === 'PATCH') && action === 'UPDATE') {
            entityId = req.params.id || (req.body && req.body._id);
            newValues = req.body;
          }
          // For DELETE requests
          else if (req.method === 'DELETE' && action === 'DELETE') {
            entityId = req.params.id;
          }
          
          // Create the audit log asynchronously (don't block the response)
          AuditLog.create({
            user: req.user.id,
            action,
            entityType,
            entityId,
            description: description || `${action} ${entityType}`,
            newValues: action !== 'DELETE' ? newValues : null,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          }).catch(err => console.error('Error creating audit log:', err));
        } catch (error) {
          console.error('Error in audit logging:', error);
        }
      }
      
      // Call the original send function
      return originalSend.call(this, body);
    };
    
    next();
  };
};

module.exports = { createAuditLog }; 