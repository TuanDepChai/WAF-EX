const express = require('express');
const router = express.Router();
const {
    getLicenses,
    getLicense,
    createLicense,
    updateLicense,
    deleteLicense,
    verifyLicense
} = require('../controllers/licenseController');

router.route('/')
    .get(getLicenses)
    .post(createLicense);

router.route('/:id')
    .get(getLicense)
    .put(updateLicense)
    .delete(deleteLicense);

router.route('/verify')
    .post(verifyLicense);

module.exports = router;