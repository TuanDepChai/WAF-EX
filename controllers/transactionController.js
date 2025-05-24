const Transaction = require('../models/Transaction');
const { generateToken } = require('../helpers/authHelper'); // If you want to use activation key generation, adjust as needed
const crypto = require('crypto');

// Helper to generate activation key
const generateActivationKey = () => crypto.randomBytes(16).toString('hex');

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('user plan');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('user plan');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const { user, plan } = req.body;
    // check duplicate transaction
    const duplicateTransaction = await Transaction.findOne({ user, plan });
    if (duplicateTransaction) {
      return res.status(400).json({ message: 'Duplicate transaction' });
    }
    // generate activation key
    const activateKey = generateActivationKey();
    const transaction = new Transaction({
      user,
      plan,
      activateKey
    });
    await transaction.save();
    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const updateData = req.body;
    // If status is being set to success, generate activation key
    if (updateData.status === 'success') {
      updateData.activateKey = generateActivationKey();
    }
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 