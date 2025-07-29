const express = require('express');
const Rule = require('../models/Rule');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all rules for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const rules = await Rule.find({ userId: req.user.id });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new rule
router.post('/', auth, async (req, res) => {
  try {
    const { type, value } = req.body;
    const rule = new Rule({ userId: req.user.id, type, value });
    await rule.save();
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a rule
router.put('/:id', auth, async (req, res) => {
  try {
    const { type, value } = req.body;
    const rule = await Rule.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { type, value },
      { new: true }
    );
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a rule
router.delete('/:id', auth, async (req, res) => {
  try {
    const rule = await Rule.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!rule) return res.status(404).json({ message: 'Rule not found' });
    res.json({ message: 'Rule deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;