const User = require('../models/User');
const { generateToken, hashPassword, comparePassword } = require('../helpers/authHelper');
const transporter = require('../config/email');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for duplicate username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user'
    });

    // Send welcome email
    try {
      await transporter.sendMail({
        from: '"F-Guard" <noreply@f-guard.vn>',
        to: email,
        subject: 'Welcome to F-Guard',
        html: `
          <h1>Welcome ${username}!</h1>
          <p>Thank you for registering with F-Guard.</p>
          <p>Your account has been successfully created.</p>
          <p>You can now login with your email and password.</p>
        `
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't return error to user, just log it
    }

    console.log("Sending email to:", email);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'User logged in successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// update profile
exports.updateProfile = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { email, phone }, { new: true });
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 

// @desc    Get all  with pagination
// @route   GET /api/auth/users
// @access  Private
exports.getUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const users = await User.find()
    .select('-password')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const totalUsers = await User.countDocuments();
  res.json({
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / parseInt(limit)),
    currentPage: parseInt(page)
  });
};

// delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ message: 'User deleted successfully' });
};
