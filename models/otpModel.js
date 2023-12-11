const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    expires: 30, // 30 seconds
    default: Date.now 
},

  attempts: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum : ['USED','UNUSED'],
    default: 'UNUSED'
  }
});

module.exports = mongoose.model('otps', otpSchema);
