const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
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
    licenseKey: {
        type: String,
        required: true,
        unique: true
    }
});

const License = mongoose.model('License', licenseSchema);

module.exports = License;
