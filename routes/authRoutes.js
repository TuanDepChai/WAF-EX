const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getUsers, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.get('/admin/users', protect, getUsers);
router.delete('/admin/users/:id', protect, deleteUser);

module.exports = router; 