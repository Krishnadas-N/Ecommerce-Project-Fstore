const User = require('../models/userModel');
const Product  = require('../models/productModel');
const Category = require('../models/CategoryModel');
const Banner = require('../models/BannerModel')
const utils = require('../utils/PassPortUtils');
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const AddressModel = require('../models/addressModel');
const OrderModel = require('../models/OrderModel')
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
let UserLoggedin = null;
const ejs = require('ejs')
const Rating =  require('../models/RatingModel')
const ReviewModel = require('../models/ReviewSchema')
const uuidv4 = require('uuid').v4;
const Referral = require('../models/ReferralModel')
const Wishlist =require('../models/wishlistModel')
const easyinvoice = require('easyinvoice')




const userHomeGet = async (req, res,next) => {
  try {

    let BlockMessage;
    if(req.session.BlockMessage){
      BlockMessage = req.session.BlockMessage;
      req.session.BlockMessage=''
    }
      let UserExist = false;
  if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
    UserExist = true;
  }
    
      // Fetch products from your database
      const products = await Product.find({isFeatured:true}).limit(12).populate('category', 'name'); //  // You can customize this query as needed
    const banners = await Banner.find({isActive:true});
    const category = await Category.find({status:'active'});
     // Fetch newly added products (assuming you have a timestamp field like createdAt)
     const newlyAddedProducts = await Product.find({isFeatured:true}).sort({ createdAt: -1 }).limit(12);

     console.log(products)
     // Fetch popular products (assuming you have a rating field)
     const popularProducts = await Product.find({isFeatured:true}).sort({ Rating: -1 }).limit(12);

      // Render the "UserHome" view and pass the products to it
      res.render('UserHome', { products,banners,category, UserExist: UserExist,BlockMessage,newlyAddedProducts,popularProducts });
  }catch(err){
    console.log(err)
    next(err)
  }
}

const userSignupGet = async (req,res,next)=>{
  try{
  console.log("SignupGet")
  if(req.query.reflink){
    req.session.reflink =req.query.reflink;
  }
  console.log(req.session.reflink)

  let UserExist = false;
  if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
    UserExist = true;
  }
  const category = await Category.find({status:'active'});
  console.log(category);
  console.log(UserExist)
  
  res.render('userSignup',{category,UserExist:UserExist})
}catch(err){
  console.log(err)
  next(err)
}
  // res.status(200).render('userSignup',{category,UserExist:UserExist})
}


const userSiginOtp = async(req,res,next)=>{
  try{
    let time;
    if(req.session.time){
      time = req.session.time
      req.session.time=''
    }
    let UserExist = false;
  if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
    UserExist = true;
  }
    const category = await Category.find({status:'active'});
   return res.render('otpSignin',{category,UserExist:UserExist,time})
  }  catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }
}





const userLoginGet = async (req, res,next) => {
  try {
    let UserExist = false;
    if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
      UserExist = true;
    }
    let errMsg;
    if(req.session.loginErr){
      errMsg=req.session.loginErr;
      req.session.loginErr = ''
    
    }
    const category = await Category.find({status:'active'});
    res.render('userLogin',{category,UserExist:UserExist,errMsg}); // Replace 'userLogin' with the actual path to your EJS file
  } catch (err) {
    // Handle any errors that might occur during rendering
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};



const userLoginPost = async (req, res,next) => {
  try {
    const { email, password } = req.body;

   
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      req.session.loginErr='User not found. Please check your email and password.'
      return res.redirect('/login')
    }
    if(user.isBlocked){
      req.session.loginErr='YOU ARE BLOCKED BY ADMININSTRATORS'
      return res.redirect('/login')
      
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      req.session.loginErr='Invalid password. Please check your password'
      return res.redirect('/login')
    }
    // const token = await user.generateAuthToken()

    // If both email and password are valid, consider the user logged in
    // You can generate a JWT token or set a session to maintain the user's login state
    const tokenObject =  utils.isssueJWT(user);
    // res.status(200).json({sucess:true,token:tokenObject.token,expiresIn:tokenObject.expiresIn,})

   // Set the cookie
   console.log(tokenObject +'wsssa')
   const userId = user._id;

    // Set the cookies
    // res.cookie('loggedUserId', userId, { ,httpOnly: true });
    res.cookie('Authorization', tokenObject.token, { maxAge: 24 * 60 * 60 * 1000,httpOnly: true });
    res.cookie('userloggedIn', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
    res.status(200).redirect('shop')
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};



const userLogoutPost = (req,res)=>{
  res.clearCookie('Authorization', {httpOnly: true});
  res.clearCookie('userloggedIn', { httpOnly: true });
  res.redirect('/login')
}



const shopUser = async (req, res,next) => {
  try {
   
      let UserExist = false;
  if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
    UserExist = true;
  }
    const itemsPerPage = 9;
    const selectedPage = req.query.page || 1;
    const selectedCategory = req.query.category || null;
    const selectedSort = req.query.sort || 'priceLowToHigh';

    // Fetch products based on filters
    let products = Product.find({ isFeatured: true }).populate('category', 'name');

    if (selectedCategory) {
      products = products.where('category').equals(selectedCategory);
    }

    // Execute the query to fetch products
    products = await products.exec();

    // Apply sorting based on the selected criteria
    if (selectedSort === 'priceLowToHigh') {
      products = products.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'priceHighToLow') {
      products = products.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'releaseDate') {
      // Sort products by release date (you'll need to specify the date property)
      products = products.sort((a, b) => a.releaseDate - b.releaseDate);
    } else if (selectedSort === 'avgRating') {
      // Sort products by average rating (you'll need to specify the rating property)
      products = products.sort((a, b) => b.avgRating - a.avgRating);
    }

    // Your pagination logic to get a subset of products based on selectedPage
    const startIndex = (selectedPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    const totalProducts = products.length;

    const newProducts = await Product.find({ isFeatured: true }).sort({ createdAt: -1 }).limit(3);

    const category = await Category.find({ status: 'active' });
   

   
    
    let productInWishlist = {};

    if (UserExist) {
      const userId = req.user._id;
  
      const wishlist = await Wishlist.findOne({ user: userId });

      paginatedProducts.forEach((product) => {
        productInWishlist[product._id] = wishlist?.products.includes(product._id) || false;
      });
    } 

    console.log( UserExist,
      paginatedProducts,
      newProducts,
      category,
      selectedPage,
      Math.ceil(totalProducts / itemsPerPage),
      totalProducts,
      selectedSort,
      productInWishlist)


    res.render('UserShop', {
      UserExist:UserExist,
      products: paginatedProducts,
      newProducts,
      category,
      currentPage: selectedPage,
      totalPages: Math.ceil(totalProducts / itemsPerPage),
      countProducts: totalProducts,
      sort:selectedSort,
      productInWishlist
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};


const resetPasswordGET = async(req,res,next)=>{
  try{
    
   
      let UserExist = false;
  if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
    UserExist = true;
  }
  const Token = req.params.tokenId;
  console.log(Token);
  if(!Token){
    return  res.status(404).json({message:'token not found'});
  }
  const user =  await User.findOne({ resetToken:Token});
  if(!user){
    return res.status(404).render('errorHandler')

  }
  if (user.resetTokenExpiration && user.resetTokenExpiration > new Date()) {
    // The token is still valid
    // Perform your reset password logic
    const category = await Category.find({status:'active'});
   return res.render('userSetNewPassword',{ Token,category,UserExist:UserExist})
  } else {
    // The token has expired
    // Handle the case where the token has expired
    return res.status(410).render('userViews/tokenExpire');

  }
  
  }
  catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }
}

const resetPasswordPost = async(req,res,next) => {
  try{
    console.log(req.body);
  const token = req.body.token;
  const password = req.body.newPassword;
  const confirm_password = req.body.confirmnewPassword;
  if(password!==confirm_password){
    return res.status(400).json({message:'The confirm password and  password must be same'})
  }
  const user =  await User.findOne({ resetToken:token});
  console.log(user)
  if(!user){
    return res.status(404).render('errorHandler')

  }
  user.password = password;
  user.resetToken = null; // Optionally, clear the reset token
  user.resetTokenExpiration = null;
  await user.save();
  // return res.status(200).json({status:true,message: 'Password reset successful' });
 return res.status(200).json({success:true,message:'Sucesfully Password Changed'})
  }
  catch (error) {
    console.error(error);
    return  res.status(500).json({message:error})
  }
  
}


const contactGet = async (req,res)=>{
   try{
      let UserExist = false;
  if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
    UserExist = true;
  }
  const category = await Category.find({status:'active'});
  res.status(200).render('userContact',{UserExist:UserExist,category})
} catch(error){
  console.error(error);
  console.log(error);
  next(error);
}
}

const userLogout = (req, res) => {
  res.clearCookie('Authorization');
  res.status(200).redirect('/');
}





//PROTECTED ROUTES>>>>>>>

const userProfileGet = async(req,res,next)=>{
  try{

    let profileMsg='';
    if(req.session.profileEditaddressError && req.session.profileEditaddressError!=''){
      profileMsg=req.session.profileEditaddressError;
      delete req.session.profileEditaddressError;

    }
    console.log("profile get")

      let UserExist = false;
  if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
    UserExist = true;
  }

    const category = await Category.find({status:'active'});

    const addresses = await AddressModel.findOne({user:req.user._id})

    // const userDetails = await User.findOne({_id:req.user._id})
    const [userDetails] = await User.aggregate([
      {
    $match: {
      _id: req.user._id, // Assuming req.user._id is accessible
       },
      },
      {
        $lookup:{
          from:"wallets",
          localField:"wallet",
          foreignField:"_id",
          as:'WalletDetails'
      }
      },
      {
      $limit:1
     }
      ]);
    // Check if WalletDetails is not an empty array
    if (userDetails.WalletDetails.length === 0) {
      userDetails.WalletDetails = null; // Set it to null or an empty object, depending on your preference
    } else {
      // Unwind only if there are WalletDetails
      userDetails.WalletDetails = userDetails.WalletDetails[0];
    }
    console.log(userDetails)

   const loggedUser = await Referral.findOne({ userId: req.user._id })
   console.log(loggedUser)

   const generatedRefLink = `${req.protocol}://${req.headers.host}/register?reflink=${loggedUser.referralLink}`
    console.log(generatedRefLink)
   

    res.status(200).render('userProfile',{category,
      UserExist:UserExist,
      addresses,
      userDetails,
      profileMsg,
      generatedRefLink})

  } catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }
}


const userAddAddress = async (req, res,next) => {
  try {
    // Get the address data from the request body
    const {
      addressType,
      houseNo,
      street,
      landmark,
      pincode,
      city,
      district,
      state,
      country
    } = req.body;

    const userId = req.user._id; // You can get the user's ID from the cookie or authentication system

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the user's address document
    let useraddresses = await AddressModel.findOne({ user: userId });

    if (!useraddresses) {
      // If the useraddresses document doesn't exist, create a new one
      useraddresses = new AddressModel({ user: userId, addresses: [] });
    }

    // Check if the address already exists for the user
    const existingAddress = useraddresses.addresses.find((address) =>
      address.addressType === addressType &&
      address.HouseNo === houseNo &&
      address.Street === street &&
      address.pincode === pincode &&
      address.city === city &&
      address.State === state &&
      address.Country === country
    );

    if (existingAddress) {
      return res.status(400).json({ success: false, message: 'Address already exists for this user' });
    }

    if (useraddresses.addresses.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'User cannot have more than 3 addresses',
      });
    }

    // Create a new address object
    const newAddress = {
      addressType: addressType,
      HouseNo: houseNo,
      Street: street,
      Landmark: landmark,
      pincode: pincode,
      city: city,
      district: district,
      State: state,
      Country: country,
    };

    useraddresses.addresses.push(newAddress);

    // Save the updated address document
    await useraddresses.save();

    // Respond with a success message
    res.status(200).json({ success: true, message: 'Address added successfully' });
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Handle validation errors
      return res.status(400).json({ success: false, message: 'Validation error', errors: err.errors });
    } else {
      console.log(err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
};


const userEditAddress = async(req,res,next)=>{
  try{
    const {
      addressType,
      HouseNo,
      Street,
      Landmark,
        pincode,
        city,
        district,
        state,
        Country
    } = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      req.session.profileEditaddressError="User not found"

        return res.redirect('/profile')
    }
    const addresses = await AddressModel.findOne({user:userId})
  
    if(!addresses){
      req.session.profileEditaddressError="Addresses not found"

      return res.redirect('/profile')
    }
    
        // Find the address you want to edit based on the provided address type
        const addressToEdit = addresses.addresses.find(addr => addr.addressType === addressType);

        if (!addressToEdit) {
          req.session.profileEditaddressError= `Address with type ${addressType} not found`

          return res.redirect('/profile')
        }

        // Update the address details
        addressToEdit.HouseNo = HouseNo;
        addressToEdit.Street = Street;
        addressToEdit.Landmark = Landmark;
        addressToEdit.pincode = pincode;
        addressToEdit.city = city;
        addressToEdit.district = district;
        addressToEdit.State = state;
        addressToEdit.Country = Country;

        // Save the updated address
        await addresses.save();

        res.status(200).redirect('/profile');

  }catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }
}

const userEditCheckoutAddress = async(req,res,next)=>{
  try{
    const {
      addressType,
      HouseNo,
      Street,
      Landmark,
        pincode,
        city,
        district,
        state,
        Country
    } = req.body;

    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
       throw new Error("user Not Found")
    }
    const addresses = await AddressModel.findOne({user:userId})
  
    if(!addresses){
      throw new Error('Addresses not found')
    }
    
        // Find the address you want to edit based on the provided address type
        const addressToEdit = addresses.addresses.find(addr => addr.addressType === addressType);

        if (!addressToEdit) {
          req.session.Adreess = `Address with type '${addressType}' not found`
          res.status(404).redirect('/cart/checkout');
  
         
        }

        // Update the address details
        addressToEdit.HouseNo = HouseNo;
        addressToEdit.Street = Street;
        addressToEdit.Landmark = Landmark;
        addressToEdit.pincode = pincode;
        addressToEdit.city = city;
        addressToEdit.district = district;
        addressToEdit.State = state;
        addressToEdit.Country = Country;

        // Save the updated address
        await addresses.save();
        req.session.Adreess = 'Address Edited Sucessfully'
        res.status(200).redirect('/cart/checkout');

  }catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }
}


const userdeleteAddress = async(req,res,next)=>{
  try{
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    const addresses = await AddressModel.findOne({user:userId})
  
    if(!addresses){
      return res.status(404).json({ success: false, message: 'Addresses not found' });
    }

    const addressTypeToDelete = req.query.addressType; // Get the addressType to delete from the query parameter
     // Find the index of the address with the provided addressType
     const addressIndexToDelete = addresses.addresses.findIndex((address) => address.addressType === addressTypeToDelete);

     if (addressIndexToDelete === -1) {
      return res.status(404).json({ success: false, message: `Address with type '${addressTypeToDelete}' not found` });
  }
   // Remove the address with the specified addressType
   addresses.addresses.splice(addressIndexToDelete, 1);

   await addresses.save();

   res.status(200).json({ success: true, message: 'Address deleted successfully' });
}catch(err){
  res.status(500).json({success: false,message:err})
  }
}

const userDetailEdit = async(req,res,next)=>{
  try{
        const { firstName, lastName, email, gender, mobile } = req.body; // Update this based on your form field names

        // 2. Perform data validation if needed
        if (!firstName || !lastName || !email || !gender || !mobile) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Add more validation as needed, e.g., email format, mobile format, etc.

        // 3. If you need to update the user's profile in your database, do it here
        // Example (assuming you're using Mongoose and have a User model):
        const userId = req.user._id;

        const user = await User.findById(userId); // Replace with your own logic to retrieve the user
        if(!user){
          return res.status(404).json({success:false,message:'Authentication is Required'})
        }

        if(user.isBlocked){
          return res.status(409).json({success:false,message:'User is Blocked'})
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.gender = gender;
        user.mobile = mobile;
        await user.save();

        // 4. If you need to handle file uploads (e.g., profile picture), use multer for file handling
        // Example with multer:
        // const profilePicture = req.file; // Assuming you have a file input with the name 'profilePicture'
        // const imagePath = profilePicture.path; // Store the path or URL to the image

        // 5. Send a success response
        return res.status(200).json({ success: true, message: 'Profile updated successfully' });
  }catch(err){
    console.log(err);
    next(err)
  }
}




const cancelOrder = async (req, res,next) => {
  try {
    const orderId = req.params.orderId;
    const {reason} = req.body
    // Check if the order exists
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Retrieve the products associated with the canceled order
    const canceledProducts = order.items;

    console.log(canceledProducts)
    // Increase stock counts for each canceled product
    for (const product of canceledProducts) {
      const productId = product.productId;
      const quantity = product.quantity;

      // Find the product in your database
      const productToUpdate = await Product.findById(productId);

      if (!productToUpdate) {
        return res.status(404).json({
          success: false,
          error: "Product not found for restocking",
        });
      }

      // Increase the stock count
      productToUpdate.countInStock += quantity;

      // Save the updated product
      await productToUpdate.save();
    }

 if(order.paymentMethod === 'cashOnDelivery'){
  order.status ='Canceled'
  order.requests.push({
    type: 'Cancel',
    status: 'Accepted',
    reason,
  });
  await order.save();
 }
 else{
  // Add the cancel request
  order.status ='Canceled'
    order.requests.push({
      type: 'Cancel',
      status: 'Pending',
      reason,
    });
    await order.save();
  }
    return res.json({ success: true, message: "Order canceled successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};


function base64_encode(file) {
  // read binary data
  const bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return Buffer.from(bitmap).toString('base64');
}



const usergetOrderInvoice = async (req, res,next) => {
  try {
    // if (req.query.from === '$2b$10$gviVtGpDfqpsAsCkbx8xaukeIQDirbAk2vIJ0IhJROGzYHeHUERp2') {

    const order = await OrderModel.findById(req.params.orderId).populate('user', 'firstName lastName email');
  

    console.log("innn")
    console.log(order, order ?.items);
    let products = order.items.map((item, index) => {
      return {
        "quantity": item.quantity,
        "price": item.productPrice,
        "tax-rate": 0.0,
        "description": item.name,
      }
    });


    var data = {
      "customize": {},
      "images": {
        "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
        // "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
      },
      "sender": {
        "company": "Fstore",
        "address": "Fstore Website",
        "zip": "680502",
        "city": "Thrissur",
        "country": "INDIA"
      },
      "client": {
        "company":  order.user.firstName+' '+order.user.lastName || "N/A",
        "address": order.deliveryAddress.HouseNo +' '+ order.deliveryAddress.Street +' '+ order.deliveryAddress.city  ,
        "city": order.deliveryAddress.city,
        "zip": "PIN :" + order.deliveryAddress.pincode,
       
        "country": order.deliveryAddress.Country,
      },
      "information": {
       
        "date": order.orderDate,
        "due-date": "PAID"
      },
      "products": products,
      "bottom-notice": "Thank you for supporting us, Inloop Watches",
      "settings": {
        "currency": "INR",
      },
      "translate": {},
    };
    easyinvoice.createInvoice(data, function (result) {
      const base64Data = result.pdf;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="INVOICE_' + Date.now() + '_.pdf"');
      const binaryData = Buffer.from(base64Data, 'base64');
      res.send(binaryData);
    });
    // } 
    // else {
    //     res.redirect('/profile')
    // }

  }  catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }

}


const downloadInvoice = async (req, res,next) => {
  try {
    const userId = req.user._id;
    console.log("HELLEOOE")
      // Fetch order details from your database using the orderId
      const order = await OrderModel.findById(req.params.orderId).populate('user', 'firstName lastName email');
  

      ejs.renderFile(path.join(__dirname, '..', 'views', 'userViews', 'invoice.ejs'), { order }, (err, htmlContent) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error rendering the PDF');
        }
    
        (async () => {
          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          await page.setContent(htmlContent);
    
          const pdfPath = path.join(__dirname,'..', 'public', `${userId}_order.pdf`);
          // await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, width: '210mm', height: '297mm', margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }, scale: 0.5 });

          await page.pdf({ path: pdfPath, format: 'A4' });
    
          await browser.close();
    
          res.setHeader('Content-Disposition', `attachment; filename=${userId}_order.pdf`);
          res.setHeader('Content-Type', 'application/pdf');
          res.sendFile(pdfPath);
        })();
      });
  }  catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }
}

const orderDetails = async (req, res,next) => {
  try {
    let UserExist = false;
    if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
      UserExist = true;
    }
    const category = await Category.find({status:'active'});
    const userId = req.user._id
    const orderId = req.params.orderId; // Get the order ID from URL parameters
    const itemId = req.query.product; // Get the product ID from the query string
    console.log(orderId,itemId)


    // Use MongoDB aggregation to find the product and other products in the same order
    const orderDetail = await OrderModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(orderId), // Convert orderId to ObjectId
          user: userId, 
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $match: {
          "productDetails._id": new mongoose.Types.ObjectId(itemId),
        },
      },
      {
       
          $addFields: {
            productDetails: {
              $mergeObjects: [
                "$productDetails",
                {
                  quantity: {
                    $reduce: {
                      input: "$items",
                      initialValue: 0,
                      in: {
                        $add: [
                          "$$value",
                          {
                            $cond: [
                              { $eq: ["$$this.productId", "$productDetails._id"] },
                              "$$this.quantity",
                              0,
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
     
        
      },
      {
        $group: {
          _id: "$_id",
          order: { $first: "$$ROOT" },
        },
      },
    ]);
    const order = orderDetail[0].order;
    if (orderDetail.length === 0) {
      return res.status(404).json({ error: 'Product not found in this order' });
    }

    console.log(orderDetail)
   
    const userRating = await Rating.findOne({ product: itemId, 'Ratings.author': userId });
   const userReview = await ReviewModel.findOne({ product: itemId, 'reviews.author': userId });
  // Display order details, product details, and other products
    console.log("order detail////////////////////////////////////////");
    console.log(order); // Full order details
    console.log("Review//////////////////////////////////////");
    
    console.log(userRating,userReview)
    // Now, you can pass these variables to your template for rendering.
    res.render('userOrderDetail', {
      order,
      category,
      UserExist:UserExist,
      userRating,
      userReview
    });
  } catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }
};


const orderRatings = async (req, res,next) => {
  try {
    console.log("rating route")
    const { rating, productId } = req.body;
    const userId = req.user._id; // Assuming you have user information in req.user

    // Check if the user has already rated the product
    const existingReview = await Rating.findOne({ product: productId, 'Ratings.author': userId });
    console.log(existingReview)
    if (existingReview) {
      // User has already rated the product, update the existing rating
      const userRating = existingReview.Ratings.find((r) => r.author.equals(userId));
      console.log(userRating)
      userRating.rating = rating;
     
      await existingReview.save();
    } else {
      // User has not rated the product, create a new rating
      const newRating = {
        author: userId,
        rating,
    
      };

      const review = new Rating({ product: productId, Ratings: [newRating] });
      await review.save();
    }

    const reviews = await Rating.find({ product: productId });
    const totalRatings = reviews.reduce((total, review) => {
      return total + review.Ratings.reduce((acc, rating) => acc + rating.rating, 0);
    }, 0);
    const averageRating = totalRatings / reviews.length;

    // Update the product's average rating
    // You need to have a Product model with an 'averageRating' field
    await Product.updateOne({ _id: productId }, { averageRating });
    res.status(201).json({message:'rating submitted sucessfully'})
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const orderReview = async (req, res,next) => {
  try {
    const { review, productId } = req.body;
    const userId = req.user._id; // Assuming you have user information in req.user

    // Find the existing review by the user and product
    const existingReview = await ReviewModel.findOne({ product: productId, 'reviews.author': userId });

    if (existingReview) {
      // If an existing review is found, update the review content
      const userReview = existingReview.reviews.find((r) => r.author.toString() === userId);
      userReview.review = review;
      await existingReview.save();
    } else {
      // If no existing review is found, create a new review object
      const newReview = {
        author: userId,
        review,
        isPublish: true, // Assuming that the new review should be published by default
      };

      const productReview = await ReviewModel.findOne({ product: productId });

      if (productReview) {
        // If there's already a review for this product, add the new review to it
        productReview.reviews.push(newReview);
        await productReview.save();
      } else {
        // If no review exists for this product, create a new review
        const newProductReview = new ReviewModel({
          product: productId,
          reviews: [newReview],
        });
        await newProductReview.save();
      }
    }

    res.json({ message: 'Review saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

 const deleteReview= async (req, res,next) => {
  console.log("deletereview set")
  const reviewId = req.params.reviewId;
  const userId = req.user._id; // Assuming you have access to the user's ID

  try {
    // Find the review based on the reviewId and user ID
    const review = await ReviewModel.findOne({ 'reviews._id': reviewId, 'reviews.author': userId });

    if (review) {
      // Filter out the user's review and update the reviews array
      review.reviews = review.reviews.filter(item => item._id != reviewId);
      await review.save();

      // Return a success response
      res.status(200).json({ message: "Review deleted successfully" });
    } else {
      // Return an error response if the review was not found or could not be deleted
      res.status(404).json({ message: "Review not found or could not be deleted" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const mobileUniqueCheck = async (req, res,next) => {
  const mobileNumber = req.query.mobile;

  try {
      // Check if the mobile number exists in the database
      const existingUser = await User.findOne({ mobile: mobileNumber });

      // Respond with the uniqueness status
      res.json({ unique: !existingUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};


const userOrderDetails = async(req,res,next)=>{
  try{
    const ITEMS_PER_PAGE = 5; 
    let page = parseInt(req.query.pageNumber) || 1;
    const orders = await OrderModel.find({user : req.user._id})
                            .sort({createdAt:-1})
                            .skip((ITEMS_PER_PAGE * page) - ITEMS_PER_PAGE)
                            .limit(ITEMS_PER_PAGE)
    const totalOrders = await OrderModel.countDocuments({user : req.user._id});
    const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
    const paginationInfo = {
      currentPage: page,
      totalPages: totalPages,
    };
    console.log(orders)
    console.log(paginationInfo)
    return res.status(200).send({orders ,paginationInfo});
  } catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }
}




const returnOrder = async(req,res,next)=>{
  try{
    const {orderId,returnReason }= req.body;
    const userId = req.user._id;
    const order = await OrderModel.findById(orderId);

    console.log(userId,order,returnReason)

    if(!order){
      return res.status(404).json({success:false,message:'order Not found in Database'})
    }
     // Check if the user making the request is the owner of the order
     if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to return this order' });
    }
      // Check if the order status allows a return
      if (order.status !== 'Delivered') {
        return res.status(400).json({ success: false, message: 'Order must be Delivered to initiate a return' });
    }
    
       // Update the order status to 'Returned'
    order.status = 'Returned';

    // Update the return request in the order
    order.requests.push({
      type: 'Return',
      status: 'Pending', // You can set it to 'Pending' initially
      reason: returnReason,
    }); 

    // Save the updated order
    await order.save();
    res.status(200).json({ success: true, message: 'Return request submitted successfully' });
}catch(err){
  console.log(err)
  res.status(500).json({ success: false, message: 'Internal Server Error' });
}
}



const userReferral = async (req, res,next) => {
  try{
  Referral.findOne({ userId: req.user._id })
      .populate('user') //Populate model with user
      .then(loggedUser => {
          //Generate random referral link
          const generatedRefLink = `${req.protocol}://${req.headers.host}/register?reflink=${loggedUser.referralLink}`

         res.status(200).json(generatedRefLink)
      })
    }catch(err){
      console.log(err);
      res.status(500).json({success:false,message:err})
    }


}

const createuserReferral = async (req, res,next) => {
  try {
    const user = await User.findById(req.user._id);

    // Create a new referral
    const newReferrer = new Referral({
      referralId: uuidv4(),
      referralLink: uuidv4(),
      userId: user._id,
    });

    // Save the new referral to the database
    await newReferrer.save();

    // Update the user's refId with the new referral's _id
    user.refId = newReferrer._id;

    // Save the user with the updated refId
    await user.save();

    console.log(newReferrer);

    // Assuming generatedRefLink should be the referral link
    const generatedRefLink = `${req.protocol}://${req.headers.host}/register?reflink=${newReferrer.referralLink}`
    res.status(200).json({ success: true, referralLink: generatedRefLink });
  } catch (err) {
   res.stauts(500).json({message:'Some error Caused '+err})
  }
};

 

module.exports = { 
  userLoginGet,
  userLoginPost,
  userLogoutPost,
  userSignupGet,
  userSiginOtp,
  userHomeGet,
  resetPasswordGET,
  resetPasswordPost,
  shopUser,
  contactGet,
  userLogout,
  userProfileGet,
  userAddAddress,
  userEditAddress,
  userdeleteAddress,
  userDetailEdit,
  cancelOrder,
  usergetOrderInvoice,
  userEditCheckoutAddress,
  orderDetails,
  orderRatings,
  orderReview,
  deleteReview,
  mobileUniqueCheck,
  userOrderDetails,
  returnOrder,
  userReferral,
  createuserReferral
 
}