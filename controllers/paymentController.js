const Transaction = require('../models/Transaction');
const Plan = require('../models/Plan');
const { createPaymentUrl, verifyReturnUrl } = require('../helpers/vnpayHelper');

// Create VNPay payment URL
exports.createVNPayPayment = async (req, res) => {
    try {
        const { user, planId } = req.body;

        console.log('Creating payment for:', { planId, user });

        // Get plan details to get the amount
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        // Create transaction record
        const transaction = await Transaction.create({
            user: user,
            plan: planId,
            amount: plan.price,
            status: 'pending'
        });

        console.log('Transaction created:', transaction._id);

        // Create payment URL
        const orderInfo = `Thanh toan goi cuoc ${plan.name}`;
        const paymentUrl = createPaymentUrl(
            transaction._id,
            plan.price,
            orderInfo
        );

        console.log('Payment URL created successfully');

        res.json({
            message: 'Payment URL created successfully',
            paymentUrl,
            transactionId: transaction._id
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Handle VNPay return URL
exports.vnpayReturn = async (req, res) => {
    try {
        const vnpParams = req.query;
        console.log('VNPay return params:', vnpParams);

        // Verify the return URL
        const isValid = verifyReturnUrl(vnpParams);
        console.log('Payment signature valid:', isValid);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Get transaction ID from vnp_TxnRef
        const transactionId = vnpParams.vnp_TxnRef;
        console.log('Processing transaction:', transactionId);

        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            console.log('Transaction not found:', transactionId);
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check payment status
        if (vnpParams.vnp_ResponseCode === '00') {
            console.log('Payment successful for transaction:', transactionId);
            // Payment successful
            transaction.status = 'success';
            await transaction.save();

            // Create license for the user
            const licenseController = require('./licenseController');
            const license = await licenseController.createLicense({
                body: {
                    user: transaction.user,
                    plan: transaction.plan
                }
            });

            console.log('License created for transaction:', transactionId);

            res.json({
                message: 'Payment successful',
                transaction,
                license
            });
        } else {
            console.log('Payment failed for transaction:', transactionId);
            // Payment failed
            transaction.status = 'failed';
            await transaction.save();

            res.status(400).json({
                message: 'Payment failed',
                transaction
            });
        }
    } catch (error) {
        console.error('Payment return processing error:', error);
        res.status(400).json({ message: error.message });
    }
}; 