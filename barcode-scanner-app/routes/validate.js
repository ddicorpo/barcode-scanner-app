const express = require('express');
const Rule = require('../models/Rule');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to check a barcode against a rule
function checkRule(barcode, rule) {
  switch (rule.type) {
    case 'length':
      return barcode.length === parseInt(rule.value, 10);
    case 'startsWith':
      return barcode.startsWith(rule.value);
    case 'regex':
      try {
        const regex = new RegExp(rule.value);
        return regex.test(barcode);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

// POST /api/validate
router.post('/', auth, async (req, res) => {
  try {
    const { barcode } = req.body;
    if (!barcode) return res.status(400).json({ message: 'Barcode is required' });

    const rules = await Rule.find({ userId: req.user.id });
    const results = rules.map(rule => ({
      rule,
      passed: checkRule(barcode, rule)
    }));

    const allPassed = results.every(r => r.passed);

    res.json({
      barcode,
      allPassed,
      results
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;