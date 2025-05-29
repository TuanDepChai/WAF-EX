const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createVNPayPayment,
    vnpayReturn
} = require('../controllers/paymentController');

// Create VNPay payment URL
router.post('/vnpay', protect, createVNPayPayment);

// VNPay return URL
router.get('/vnpay_return', vnpayReturn);

module.exports = router; 