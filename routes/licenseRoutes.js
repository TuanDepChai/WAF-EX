const express = require('express');
const router = express.Router();
const {
    getLicenses,
    getLicense,
    createLicense,
    updateLicense,
    deleteLicense,
    verifyLicense,
    getUserLicenses
} = require('../controllers/licenseController');

router.route('/')
    .get(getLicenses)
    .post(createLicense);

router.route('/:id')
    .get(getLicense)
    .put(updateLicense)
    .delete(deleteLicense);

router.route('/user/:id')
    .get(getUserLicenses);

router.route('/verify')
    .post(verifyLicense);

module.exports = router;