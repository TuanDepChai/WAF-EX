const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    activateKey: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);