const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
    res.send('Barcode Scanner API is running!');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const ruleRoutes = require('./routes/rules');
app.use('/api/rules', ruleRoutes);

const validateRoutes = require('./routes/validate');
app.use('/api/validate', validateRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});