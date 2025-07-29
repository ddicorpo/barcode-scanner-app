const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., 'length', 'startsWith', 'regex'
  value: { type: String, required: true }
});

module.exports = mongoose.model('Rule', RuleSchema);