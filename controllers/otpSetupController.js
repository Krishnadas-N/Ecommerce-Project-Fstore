const { transporter } = require('../config/otpGenerator'); // Import your Nodemailer transporter
const utils = require('../utils/PassPortUtils');
require('dotenv').config();
const uuidv4 = require('uuid').v4;
const otpModel = require('../models/otpModel')

const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const crypto = require('crypto')
const Referral = require('../models/referralModel');
const Wallet =  require('../models/walletModel')


const generateOTP = () => {
  // Define a character set containing only numeric characters (0-9)
  const numericCharacterSet = '0123456789';

  // Generate a random OTP of a specified length using the numeric character set
  const otpLength = 6; // You can adjust the length as needed
  let otp = '';
  
  for (let i = 0; i < otpLength; i++) {
    const randomIndex = Math.floor(Math.random() * numericCharacterSet.length);
    otp += numericCharacterSet.charAt(randomIndex);
  }

  return otp;
};



const sendOTPByEmail = async(email, otp) => {
  try{
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is: ${otp}`,
    };
    await transporter.sendMail(mailOptions);

     await otpModel.updateOne({email:email},{
      $inc:{attempts:1},
      $set:{
        otp:otp
      }
      
      
    },{upsert:true})

    // const otpDoc = new otpModel({
    //   email,
    //   otp,
    // });
   
    // await otpDoc.save();


  }catch(err){
    console.log("catch error working ");
    console.error(err)
    throw new Error('Error in OTP generation');
  }
};


const createUser = async (req, res) => {
  try {
    req.session.formData = req.body;
    console.log(req.body)
    console.log('///////////////////////////////////////////////////');
    console.log(req.session.formData);

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email:req.body.email });

    if (existingUser) {
      return res.status(400).json({success:false, errors: 'User with this email already exists. Please login again.' });
    }
    const otp = generateOTP();
    console.log(otp);
  
    await sendOTPByEmail(req.body.email, otp);
    req.session.time = "start"
    
    // Respond with the saved user data and token
    // res.status(201).redirect('/api/home/verify-signin');
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({errors: 'Server error'+err });
  }
};


const verifyuserSigin = async(req,res)=>{
  try{

    if (!req.session.formData) {
      return res.status(400).json({ error: 'User data not found in session' });
    }
    const { email} = req.session.formData
    console.log( req.session.formData)
    const otp = req.body.otp;
    const otpDoc = await otpModel.findOne({ email });

  

 if (!otpDoc) {
  return res.status(404).json({ error: 'OTP not found' });
}

if (otpDoc.otp === otp && otpDoc.status === 'UNUSED') {
  // Mark OTP as used
  otpDoc.status = 'USED';
  await otpDoc.save();
  
  const { firstName,lastName,email,gender,mobile,password} = req.session.formData;
  const newUser = new User({
    firstName,
    lastName,
    email,
    gender,
    mobile,
    password, // Replace 'hashedPassword' with the actual hashed password
  });
  await newUser.save();

    const newReferrer = new Referral({
      referralId: uuidv4(),
      referralLink: uuidv4(),
      userId: newUser._id,
  });

  newReferrer.save()
  console.log(newReferrer)

  newUser.refId = newReferrer._id;
  await newUser.save();

  const newWallet = new Wallet({
    user: newUser._id,
  });
  await newWallet.save();

  newUser.wallet = newWallet._id;
  await newUser.save();

  if (req.session.reflink) {
    try {
      const referrer = await Referral.aggregate([
        {
          $match: {
            referralLink: req.session.reflink,
          },
        },
        {
          $lookup: {
            from: 'users', // Make sure to use the actual name of your User collection
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $lookup: {
            from: 'wallets', // Make sure to use the actual name of your Wallet collection
            localField: 'user.wallet',
            foreignField: '_id',
            as: 'wallet',
          },
        },
        {
          $unwind: '$wallet',
        },
        {
          $project: {
            userId: '$user._id',
            wallet: '$wallet',
          },
        },
      ]);
  
      console.log(referrer);
  
      if (referrer.length > 0) {
        const referralAmount = 500; // Change this to the desired referral amount
        const referralBonus = referralAmount * 0.5;
  
        referrer[0].wallet.balance += referralBonus;
        referrer[0].wallet.transactions.push({
          amount: referralAmount,
          type: 'credit',
          description: 'Referral Bonus',
        });
  
        await Wallet.findByIdAndUpdate(referrer[0].wallet._id, referrer[0].wallet);
  
        newWallet.balance += referralBonus;
        newWallet.transactions.push({
          amount: referralBonus,
          type: 'credit',
          description: 'Referral Bonus',
        });
        newWallet.save();
      }
    } catch (err) {
      console.error('Error finding referral:', err);
      res.status(500).json({ success: false, message: err });
    }
  }
  
  // Save the new user to the database
 
   
  req.session.formData=null;
  return res.status(200).json({message:'User Created successfully'})

 }else{
  return res.status(409).json({messgae:'The otp is already used'})
 }
  }catch(err){
    console.log(err);
    res.status(500).json({message:'Internal Server error'})
  }
}

const resendOtpSiginin =  async (req, res) => {
  try {
    const email = req.session.formData.email;
    // Check if there's an existing OTP document with the same email
    const existingOTP = await otpModel.findOne({ email });
    console.log(email,existingOTP)
    if (existingOTP!==undefined || existingOTP.status !== 'USED') {
      // Generate a new OTP
      const otp = generateOTP();
      console.log(otp);

      // Create or update the OTP document
      if (existingOTP) {
        existingOTP.otp = otp;
        existingOTP.status = 'UNUSED';
        await existingOTP.save();
      } else {
        // Create a new OTP document
        await otpModel.create({ email, otp, status: 'UNUSED' });
      }

      // Send the new OTP to the user
      await sendOTPByEmail(email, otp);
      return res.status(200).json({ message: 'OTP resent successfully' });
    } else {
      return res.status(400).json({ error: 'OTP resend is not allowed at this time' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}




const sendOtp = async (req, res) => {
  try{
  const { email } = req.body;
  console.log(email);

  const user = await User.findOne({ email });
  if (!user) {
   return res.status(401).json({ error: 'User not found.' });
  }
  else if(user.isBlocked){
    return res.status(403).json({message:'YOU ARE BLOCKED BY ADMININSTRATORS'})
  }
  else{
    const otp = generateOTP();
    console.log(otp);
  
    await sendOTPByEmail(email, otp);
  
    res.status(200).json({ status: true });
  }
  }catch(error){
    console.error(error)
    res.status(500).send({message:'Some ERROR causes on Otp Generation'})
  }
 
};







const verifyOtpPost = async(req, res) => {
  const {  otp, email } = req.body;

  try{
 // Retrieve the OTP document from the database based on the email
 const otpDoc = await otpModel.findOne({ email });

//  storeEmail = null;

 if (!otpDoc) {
  return res.status(404).json({ error: 'OTP not found' });
}

if (otpDoc.otp === otp && otpDoc.status === 'UNUSED') {
  // Mark OTP as used
  otpDoc.status = 'USED';
  await otpDoc.save();
  const user = await User.findOne({email})
  const tokenObject =  utils.isssueJWT(user);

  console.log(tokenObject +'wsssaOTP SIDE')
  res.cookie('Authorization', tokenObject.token, { maxAge: 24 * 60 * 60 * 1000,httpOnly: true });
  res.cookie('userloggedIn', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
  return res.status(200).redirect('/shop')

 }else{
  return res.redirect('login')
 }
}catch(error){

    res.status(400).json({ error: 'Invalid OTP' });
  
}
}


const forgotPassword =async (req,res)=>{
  try{
    let UserExist = false;
    if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
      UserExist = true;
    }
    const category = await Category.find({status:'active'});
  res.status(200).render('userForgotPassword',{category,UserExist:UserExist})
  }  catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }
}

const forgotPasswordPost = async (req, res) => {
  try {
    console.log(req.body)
    const email  = req.body.Email;
    console.log(email)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({success:false, message: 'User is not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    await User.updateOne({ email }, {
      $set: {
        resetToken: token,
        resetTokenExpiration: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes in milliseconds
      },
    });

    const mailOptions = {
      to: email,
      subject: 'Password Reset Request',
      text: `Click the following link to reset your password: ${req.protocol}://${req.headers.host}/reset-password/${token}`,
      html: `<h5>Click the following link to reset your password:</p><p><a href=${req.protocol}://${req.headers.host}/reset-password/${token}>http://localhost:3000/reset-password/${token}</a></h5>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({success:true, message: 'Reset password link is sent successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({success:false, message: `INTERNAL SERVER ERROR ${err}` });
  }
};


//To Edit Account Details From Profile
const userDetailEditCOnfirmation = async(req,res)=>{
  try{
    const email = req.user.email;
     const user = await User.findOne({email});
     if (!user) {
      return res.status(401).json({ error: 'User not found.' });
     }
     else if(user.isBlocked){
       return res.status(403).json({message:'YOU ARE BLOCKED BY ADMININSTRATORS'})
     }
     else{
       const otp = generateOTP();
       console.log(otp+'This is sdit Account');
     
       await sendOTPByEmail(email, otp);
     
       res.status(200).json({success:true,message:'Otp Send Successfully' });
     
     }
  }catch(err){
    console.log(err);
    next(err)
  }
}

const userDetailEditVerify = async(req,res)=>{
  try{
    const email = req.user.email;
    const {  otp } = req.body;

    
   // Retrieve the OTP document from the database based on the email
   const otpDoc = await otpModel.findOne({ email });
  
  //  storeEmail = null;
  
   if (!otpDoc) {
    return res.status(404).json({success:false, error: 'OTP not found' });
  }
  
  if (otpDoc.otp === otp && otpDoc.status === 'UNUSED') {
    // Mark OTP as used
    otpDoc.status = 'USED';
    await otpDoc.save();
  }
  return res.status(200).json({success:true,message:'Otp Verification Successfull'})
}catch(err){
    console.log(err);
    next(err);
  }
}

const changePassword = async(req,res)=>{
  try {
    let UserExist = false;
    if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
      UserExist = true;
    }
    const userId = req.user._id
    const userDetails = await User.findOne({ _id:userId });
    if (!userDetails) {
      return res.status(404).json({ message: 'User is not found' });
    }
    const email = userDetails.email;
    const token = crypto.randomBytes(32).toString('hex');
    await User.updateOne({ _id:userId }, {
      $set: {
        resetToken: token,
        resetTokenExpiration: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes in milliseconds
      },
    });

    const mailOptions = {
      to: email,
      subject: 'Password Reset Request',
      text: `Click the following link to reset your password: http://localhost:3000/reset-password/${token}`,
      html: `<p>Click the following link to reset your password:</p><p><a href="http://localhost:3000/reset-password/${token}">http://localhost:3000/home/reset-password/${token}</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({ message: 'Reset password link is sent successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `INTERNAL SERVER ERROR ${err}` });
  }
}


const userContactPost = async(req, res) => {
  try{
  const { name, email, telephone, subject, message } = req.body;

  

  // Setup email data
  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL, // Change to your receiving email
    subject: subject,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${telephone}\n\nMessage: ${message}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({message:'Internal Server Error'});
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('OK');
    }
  });
  }catch(err){
    res.status(500).json({message:err})
  }
}
module.exports = { 
  createUser,
  verifyuserSigin,
  resendOtpSiginin,
  sendOtp,
  verifyOtpPost,
  forgotPassword,
  forgotPasswordPost,
  userDetailEditCOnfirmation,
  userDetailEditVerify,
  userContactPost,
  changePassword }