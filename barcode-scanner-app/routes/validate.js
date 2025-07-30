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
    const { barcode, ruleIds } = req.body; // Accept ruleIds array
    if (!barcode) return res.status(400).json({ message: 'Barcode is required' });

    // Build the query - if ruleIds provided, filter by them
    let query = { userId: req.user.id };
    if (ruleIds && Array.isArray(ruleIds) && ruleIds.length > 0) {
      query._id = { $in: ruleIds }; // Only get rules with these IDs
    }

    // Get rules (either all user's rules, or just selected ones)
    const rules = await Rule.find(query);
    
    if (rules.length === 0) {
      return res.status(404).json({ message: 'No rules found' });
    }

    const results = rules.map(rule => ({
      rule,
      passed: checkRule(barcode, rule)
    }));

    const allPassed = results.every(r => r.passed);

    res.json({
      barcode,
      allPassed,
      results,
      totalRules: results.length // Show how many rules were tested
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;