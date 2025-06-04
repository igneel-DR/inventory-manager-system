import asyncHandler from 'express-async-handler'; // For handling exceptions in async routes
import User from '../models/User.js'; // Assuming your User model is User.js
import bcrypt from 'bcryptjs'; // For hashing passwords

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password'); // Exclude passwords
  res.json(users);
});

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please provide name, email, password, and role');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Hash password before saving (ensure this is also handled in User model pre-save if not already)
  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password, // Assuming User model has a pre-save hook for hashing
    role,
    // isActive: true, // Default in schema or set here
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email; // Consider implications of email change
    user.role = req.body.role || user.role;
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

    // Password updates should ideally be handled separately or with great care
    // if (req.body.password) {
    //   user.password = req.body.password; // Ensure hashing in pre-save hook
    // }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user (or deactivate)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Option 1: Hard delete (not recommended for data integrity)
    // await user.deleteOne(); 
    // res.json({ message: 'User removed' });

    // Option 2: Soft delete (mark as inactive) - Recommended
    if (user.email === process.env.ADMIN_EMAIL) { // Example: Prevent deletion of a super admin
        res.status(400);
        throw new Error('Cannot delete system administrator account.');
    }
    user.isActive = false;
    await user.save();
    res.json({ message: `User ${user.name} deactivated` });

  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
}; 