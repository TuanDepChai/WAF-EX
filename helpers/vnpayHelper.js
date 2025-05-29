const crypto = require('crypto');
const moment = require('moment');
const querystring = require('querystring');

// VNPay sandbox configuration
const config = {
    vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_HashSecret: process.env.VNP_HASH_SECRET,
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:3000/api/payments/vnpay_return',
    vnp_Command: 'pay',
    vnp_CurrCode: 'VND',
    vnp_Locale: 'vn',
    vnp_Version: '2.1.0'
};

// Create payment URL (refactored to use URL and URLSearchParams)
exports.createPaymentUrl = (orderId, amount, orderInfo, orderType = 'other') => {
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');

    const orderIdToString = orderId.toString();
    const amountToString = (amount * 100).toString(); // Convert to smallest currency unit (cents)

    const vnp_Params = {
        vnp_Version: config.vnp_Version,
        vnp_Command: config.vnp_Command,
        vnp_TmnCode: config.vnp_TmnCode,
        vnp_Locale: config.vnp_Locale,
        vnp_CurrCode: config.vnp_CurrCode,
        vnp_TxnRef: orderIdToString,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_Amount: amountToString,
        vnp_ReturnUrl: config.vnp_ReturnUrl,
        vnp_IpAddr: '127.0.0.1', // This should be the client's IP in production
        vnp_CreateDate: createDate
    };

    // Build URL and search params
    const redirectUrl = new URL(config.vnp_Url);
    Object.entries(vnp_Params)
        .sort(([key1], [key2]) => key1.localeCompare(key2))
        .forEach(([key, value]) => {
            if (!value || value === '' || value === undefined || value === null) {
                return;
            }
            redirectUrl.searchParams.append(key, value.toString());
        });

    // Generate secure hash from the query string (without '?')
    const secretKey = config.vnp_HashSecret;
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac
        .update(Buffer.from(redirectUrl.search.slice(1).toString(), 'utf-8'))
        .digest('hex');

    redirectUrl.searchParams.append('vnp_SecureHash', signed);

    return redirectUrl.toString();
};

// Verify return URL
exports.verifyReturnUrl = (vnpParams) => {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    // Sort params alphabetically
    const sortedParams = sortObject(vnpParams);
    
    // Create sign data
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', config.vnp_HashSecret);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
};

// Helper function to sort object
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
        if (obj[key] !== null && obj[key] !== undefined) {
            sorted[key] = obj[key];
        }
    }
    
    return sorted;
} 