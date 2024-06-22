const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config();
const bcrypt = require('bcryptjs');


// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    profile:{
        type:String,

    },
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        validate( value ) {
           if( !validator.isEmail( value )) {
                throw new Error( 'Email is invalid' )
                 }
            }
    },
    gender:{
        type:String,
        required:true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet', // Reference to the 'Wallet' model
    },
    refId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "referrals",
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    mobile:{
        type:Number,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    resetToken: {
        type: String,
      },
      resetTokenExpiration: {
        type: Date,
      },
    tokens: [{
        token: {
        type: String,
        
          }
        }]
      }, {
      timestamps: true
});


// Hash plain password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        console.log(user.password)
        user.password = await bcrypt.hash(user.password, 10);
        console.log(user.password)
    }

    // Call next to continue with the saving process
    next();
});

// Static method to find a user by credentials
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Unable to log in');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Unable to login');
    }
    return user;
};


userSchema.methods.generateAuthToken = async function () {
    const user = this
     const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET)
 user.tokens = user.tokens.concat({token})
    await user.save()
    return token
 }

 const  User = mongoose.model('User', userSchema);
//Hash plain password before saving


//Export the model
module.exports = User;