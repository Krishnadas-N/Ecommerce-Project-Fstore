const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// Declare the Schema of the Mongo model
const adminSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
});

adminSchema.pre('save', async function (next) {
    try {
      if (!this.isModified('password')) {
        return next(); // Skip hashing if password is not modified
      }
  
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
  
      // Hash the password with the salt
      const hashedPassword = await bcrypt.hash(this.password, salt);
  
      // Replace the plain text password with the hashed password
      this.password = hashedPassword;
  
      next();
    } catch (error) {
      next(error);
    }
  });

//Export the model
module.exports = mongoose.model('Admin', adminSchema);