import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Please contact admin.'});
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // User matched, create JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      //{ expiresIn: '1h' }, // Adjust token expiry as needed
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: { id: user.id, email: user.email, role: user.role, name: user.name }
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Register user
export const registerUser = async (req, res) => {
  const { email, password, role, name } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user instance
    user = new User({
      email,
      password,
      role, // Optional: admin could set this, or default applies
      name
    });

    await user.save();

    // Create a token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token,
          user: { id: user.id, email: user.email, role: user.role, name: user.name }
        });
      }
    );

  } catch (error) {
    console.error(error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).send('Server error');
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    // Find the user by id
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store previous values for audit log
    const previousValues = {
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    // Update user fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    // Special handling for email changes (may require verification in production)
    if (email && email !== user.email) {
      // Check if email already exists
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    // Save the user
    const updatedUser = await user.save();

    // Create audit log entry
    await AuditLog.create({
      user: userId,
      action: 'UPDATE',
      entityType: 'user',
      entityId: userId,
      description: 'Updated user profile',
      previousValues,
      newValues: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Return the updated user without sensitive information
    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Error updating profile' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate request
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password is correct
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save the user with new password
    await user.save();

    // Create audit log entry
    await AuditLog.create({
      user: userId,
      action: 'UPDATE',
      entityType: 'user',
      entityId: userId,
      description: 'Changed password',
      // Don't log password values for security
      previousValues: null,
      newValues: null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({ message: 'Error changing password' });
  }
};

// Export all functions
export default {
  loginUser,
  registerUser,
  getMe,
  updateProfile,
  changePassword
}; 