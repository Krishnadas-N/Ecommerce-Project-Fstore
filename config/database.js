// config/database.js
require('dotenv').config();
const mongoose = require('mongoose');

// Define the database connection URL
const databaseURL = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(databaseURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;
