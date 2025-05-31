const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getUserTransactions
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
router.route('/')
  .post(createTransaction);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

router.route('/user/:id')
  .get(getUserTransactions);

router.route('/admin/history')
  .get(protect, getTransactions);

module.exports = router; 