const Transaction = require('../models/Transaction');
const Plan = require('../models/Plan');
const licenseController = require('./licenseController');

// Get all transactions with pagination
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Create query object based on status parameter
    const query = status ? { status: { $in: [status] } } : {};
    
    const transactions = await Transaction.find(query)
      .populate('user plan')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const totalTransactions = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(totalTransactions / parseInt(limit));
    
    // Get total amount and extract just the value
    const totalAmountResult = await Plan.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$price' }
        }
      }
    ]);
    const totalTransactionMade = await Transaction.countDocuments(query);
    
    // Get count of unique users who made transactions
    const totalUserBought = await Transaction.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: '$user'
        }
      },
      {
        $count: 'totalUniqueUsers'
      }
    ]);

    // Get separate counts for success and failed transactions
    const successCount = await Transaction.countDocuments({ status: 'success' });
    const failedCount = await Transaction.countDocuments({ status: 'failed' });

    const totalAmount = totalAmountResult[0]?.totalAmount || 0;

    res.json({
      transactions,
      totalTransactions,
      totalPages,
      currentPage: parseInt(page),
      totalAmount,
      totalTransactionMade,
      totalUserBought: totalUserBought[0]?.totalUniqueUsers || 0,
      successCount,
      failedCount
    });
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

// Get user transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).populate('plan');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const { user, plan } = req.body;
    const transaction = new Transaction({
      user,
      plan
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
    // If status is being set to success, create a new license
    if (updateData.status === 'success') {
      await licenseController.createLicense({
        body: {
          user: updateData.user,
          plan: updateData.plan
        }
      });
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