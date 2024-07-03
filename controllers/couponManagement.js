const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const { Coupon,
  updateCouponStatus,} = require('../models/couponModel')
  const cron = require('node-cron');

// Schedule the function to run every day at midnight (adjust the schedule as needed)
cron.schedule('0 0 * * *', () => {
  updateCouponStatus();
});



  
  exports.couponManagementGet = async (req,res,next)=>{
    try{

      const page = req.query.page?parseInt(req.query.page): 1;
      const limit = 8;
      const skip = (page - 1) * limit;
      
      let errorMessage='' ;
      let sucessMessage= '';
      if(req.session.couponErr){
        errorMessage = req.session.couponErr;
        req.session.couponErr=''
      }
      if(req.session.couponSucess){
        sucessMessage=req.session.couponSucess;
        req.session.couponSucess=''
      }

      const coupons = await Coupon.find({}).sort({createdAt: -1}).lean().skip(skip)
      .limit(limit);

      const totalCount = await Coupon.countDocuments();

      const totalPages = Math.ceil(totalCount / limit );

      console.log(coupons)
        res.render('couponManagement',{pagetitle: 'Coupons'
        ,errorMessage,
        currentPage:page,
        totalPages,
        sucessMessage,
        coupons
      })

    }catch (error) {
      // Pass the error to the error handling middleware
      error.adminError = true;
      next(error);
    }
}

exports.couponCreate = async (req, res,next) => {
  try {
    // Retrieve coupon data from the request body

    const {
      code,
      description,
      minimumAmount,
      maximumAmount,
      maxDiscountAmount,
      expirationDate,
      maxUsers
    } = req.body;
    
    const discountPercentage = parseInt(req.body.discountPercentage);


    // Check if a coupon with the same code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (existingCoupon) {
      
      req.session.couponErr = 'Coupon code already exists'
      console.log( req.session.couponErr)
      return res.redirect('/admin/coupon-management');
    }

    // Additional validation checks
    if (code.length < 6) {
      req.session.couponErr = 'Coupon code must be at least 6 characters'
      console.log( req.session.couponErr)
      return res.redirect('/admin/coupon-management');
     
    }

    if (discountPercentage < 1) {
      req.session.couponErr = 'Discount amount must be at least 1'
      console.log( req.session.couponErr)
      return res.redirect('/admin/coupon-management');
      
    }

    // Create the coupon
    const coupon = new Coupon({
      code: code, // Ensure the code is in uppercase
      description,
      maxDiscountAmount,
      minimumAmount,
      maximumAmount,
      discountPercentage: discountPercentage,
      expirationDate,
      maxUsers: maxUsers > 0 ? maxUsers : null, // Set maxUsers to null if less than or equal to 0
     
    });

    // Save the coupon to the database
    const savedCoupon = await coupon.save();
    console.log(savedCoupon)
    // Send a success response with the saved coupon
    req.session.couponSucess= 'Coupon Created Successfully'
    return res.redirect('/admin/coupon-management');
  } catch (err) {
    // Handle any errors, e.g., database errors
    console.error(err);
    req.session.couponErr = 'An error occurred while creating the coupon'
    return res.redirect('/admin/coupon-management');
  }
};



exports.couponUpdate= async (req, res,next) => {
  const itemId = req.params.Id;
  const activate = req.query.activate === 'true'; // Convert the query parameter to a boolean

  try {
    // Check if the coupon with the provided ID exists
    const coupon = await Coupon.findById(itemId);
    
    if (!coupon) {
      console.log(coupon)
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    // Additional validation checks
    if (activate && coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon is already active' });
    } else if (!activate && !coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon is already inactive' });
    }

    // Update the coupon's activation status
    const updatedCoupon = await Coupon.findByIdAndUpdate(itemId, { isActive: activate });

    if (updatedCoupon) {
      return res.json({ success: true, message: 'Activation status updated successfully' });
    } else {
      return res.status(500).json({ success: false, message: 'Error updating activation status' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error updating activation status', error });
  }
}


exports.couponEdit = async (req, res,next) => {
  try {
    const couponId = req.params.Id;
    const updatedCouponData = req.body;

    // Check if the coupon with the given ID exists
    const existingCoupon = await Coupon.findById(couponId);
    if (!existingCoupon) {
      req.session.couponErr = 'Coupon not found';
      return res.redirect('/admin/coupon-management');
    }

    // Define the fields you want to update
    const {
      code,
      description,
      minimumAmount,
      maximumAmount,
      maxDiscountAmount,
      expirationDate,
      maxUsers,
      discountPercentage,
    } = updatedCouponData;

    // Validate the discountPercentage field to ensure it's a valid number
    if (typeof discountPercentage !== 'number') {
      req.session.couponErr = 'Invalid discount percentage';
      return res.redirect('/admin/coupon-management');
    }

    // Create an object to store only the fields you want to update
    const updatedFields = {
      code,
      description,
      minimumAmount,
      maximumAmount,
      maxDiscountAmount,
      expirationDate,
      maxUsers,
      discountPercentage,
    };

    // Update the coupon using Mongoose
    const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, updatedFields, { new: true });
    console.log(updatedCoupon);
    req.session.couponSucess = 'Coupon Edited Successfully';
    res.redirect('/admin/coupon-management');
  } catch (error) {
    // Pass the error to the error handling middleware
    error.adminError = true;
    next(error);
  }
};


