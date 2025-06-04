import Setting from '../models/Setting.js';
import AuditLog from '../models/AuditLog.js';

// Get system settings
const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({}).lean();
    
    // If no settings exist yet, create default settings
    if (!settings) {
      const defaultSettings = new Setting();
      settings = await defaultSettings.save();
    }
    
    return res.status(200).json(settings);
  } catch (error) {
    console.error('Error getting settings:', error);
    return res.status(500).json({ message: 'Error retrieving settings' });
  }
};

// Update system settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({});
    
    // If no settings exist yet, create default settings
    if (!settings) {
      settings = new Setting();
    }
    
    // Store previous values for audit logging
    const previousValues = { ...settings.toObject() };
    
    // Update the fields that are provided
    if (req.body.minStockThreshold !== undefined) {
      settings.minStockThreshold = req.body.minStockThreshold;
    }
    
    if (req.body.company) {
      if (req.body.company.name) settings.company.name = req.body.company.name;
      if (req.body.company.address) settings.company.address = req.body.company.address;
      if (req.body.company.phone) settings.company.phone = req.body.company.phone;
      if (req.body.company.email) settings.company.email = req.body.company.email;
      if (req.body.company.logo) settings.company.logo = req.body.company.logo;
    }
    
    if (req.body.locale) {
      if (req.body.locale.language) settings.locale.language = req.body.locale.language;
      if (req.body.locale.currency) settings.locale.currency = req.body.locale.currency;
      if (req.body.locale.dateFormat) settings.locale.dateFormat = req.body.locale.dateFormat;
    }
    
    // Set who updated the settings
    settings.updatedBy = req.user.id;
    
    // Save the settings
    const updatedSettings = await settings.save();
    
    // Create audit log entry
    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE',
      entityType: 'setting',
      entityId: updatedSettings._id,
      description: 'Updated system settings',
      previousValues,
      newValues: updatedSettings.toObject(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return res.status(200).json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ message: 'Error updating settings' });
  }
};

export {
  getSettings,
  updateSettings,
}; 