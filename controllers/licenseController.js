const License = require('../models/License');
const crypto = require('crypto');

// Helper to generate license key
const generateLicenseKey = () => {
  let finalKey = '';
  for (let i = 0; i < 4; i++) {
    const key = Math.random().toString(16).slice(2, 10) + '-';
    finalKey += key;
  }
  return finalKey.slice(0, -1);
}

// Get all licenses
exports.getLicenses = async (req, res) => {
  try {
    const licenses = await License.find().populate('user plan transaction');
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single license
exports.getLicense = async (req, res) => {
  try {
    const license = await License.find({user: req.params.id}).populate('user plan transaction');
    if (!license) return res.status(400).json({ message: 'License not found' });
    res.json(license);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user licenses
exports.getUserLicenses = async (req, res) => {
  try {
    const licenses = await License.find({ user: req.params.id }).populate('user plan transaction');
    res.json(licenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create license
exports.createLicense = async (req, res) => {
  try {
    const { user, plan } = req.body;
    const licenseKey = generateLicenseKey();

    const license = new License({
      user,
      plan,
      licenseKey
    });

    await license.save();
    res.status(201).json({
      message: 'License created successfully',
      license
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update license
exports.updateLicense = async (req, res) => {
  try {
    const license = await License.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!license) return res.status(404).json({ message: 'License not found' });
    res.json(license);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete license
exports.deleteLicense = async (req, res) => {
  try {
    const license = await License.findByIdAndDelete(req.params.id);
    if (!license) return res.status(404).json({ message: 'License not found' });
    res.json({ message: 'License deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify license key
exports.verifyLicense = async (req, res) => {
  try {
    const { licenseKey } = req.body;
    const license = await License.findOne({ licenseKey }).populate('user plan');

    if (!license) {
      return res.status(404).json({ message: 'Invalid license key' });
    }

    res.json({
      isValid: true,
      license
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 