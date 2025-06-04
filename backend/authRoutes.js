// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    if (!name) {
        return res.status(400).json({ message: 'Name is required for registration' });
    }

    // Create new user instance (password will be hashed by pre-save hook)
    user = new User({
      name,
      email,
      password,
      role,
    });

    await user.save();

    // Create a token (optional for registration, but good for immediate login)
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
      }
    );

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'An error occurred while registering the user' });
  }
}); 