const express = require('express');
const router = express.Router();


require('dotenv').config();

const { 
     userLoginGet,
     userEditCheckoutAddress,
      userLoginPost,
      userLogoutPost,
      userSignupGet,
      userHomeGet,
      resetPasswordGET,
      resetPasswordPost,
      userGetOtp,
      shopUser,
      contactGet,
      userLogout,
      userProfileGet,
      userAddAddress,
      userEditAddress,
      userdeleteAddress,
      userDetailEdit,
      userSiginOtp,
      cancelOrder,
      usergetOrderInvoice,
      orderDetails,
      orderRatings,
      orderReview,
      deleteReview,
      returnOrder,
      mobileUniqueCheck,
      userOrderDetails,
      userReferral,
      createuserReferral
      
     } = require('../controllers/userController')

const { verifyuserSigin,createUser,
     resendOtpSiginin,
     sendOtp,
     verifyOtpPost,
     forgotPassword,
     forgotPasswordPost,
     userDetailEditCOnfirmation,
     userDetailEditVerify,
     changePassword,
     userContactPost
      } = require('../controllers/otpSetupController')

const {
     ProductDetailedView,
} = require('../controllers/productManagement')

const WalletController = require('../controllers/walletController')
const cartController = require('../controllers/cartController')


const blockMiddleware = require('../middlewares/checkBlocked');
const {requireJWTAuthentication ,loggingOrNot,CommonRouteAuthentication}= require('../middlewares/auth')





/* GET home page. */
router.get('/',userHomeGet);


router.get('/shop',CommonRouteAuthentication,shopUser)

router.get('/product-detail/:productId',CommonRouteAuthentication,blockMiddleware,ProductDetailedView)



router.get('/register',loggingOrNot,blockMiddleware,userSignupGet)//api/users/reguster

router.post('/register',createUser);

router.get('/check-mobile',mobileUniqueCheck)

router.get('/verify-signin',loggingOrNot,userSiginOtp);

router.post('/verify-signin',verifyuserSigin);

router.post('/resend-otp',resendOtpSiginin)

router.get('/login',loggingOrNot,blockMiddleware,userLoginGet);

router.post('/login',loggingOrNot,blockMiddleware,userLoginPost);

router.get('/logout',userLogoutPost);

router.post('/sendOtp',sendOtp); // this route is going after enter login with otp and then redirect into /get-otp

// router.get('/verify-otp',sendOtpGet)

router.post('/verify-otp',verifyOtpPost)

router.get('/contact',contactGet)

//FORGOT PASSWORD 
router.get('/forgot-password',forgotPassword)

router.post('/forgot-password',forgotPasswordPost)

//RESET PASSWORD

router.get('/reset-password/:tokenId',resetPasswordGET);

router.post('/reset-password',resetPasswordPost);

router.post('/send-message',userContactPost)



//Protected Routes

router.get('/profile',requireJWTAuthentication,blockMiddleware,userProfileGet)

router.post('/profile/addAddress',requireJWTAuthentication,blockMiddleware,userAddAddress)

router.post('/profile/editAddress',requireJWTAuthentication,blockMiddleware,userEditAddress)

router.delete('/profile/deleteAddress',requireJWTAuthentication,blockMiddleware,userdeleteAddress)

router.post('/profile/editConfirmation',requireJWTAuthentication,blockMiddleware,userDetailEditCOnfirmation)

router.post('/profile/editVerify',requireJWTAuthentication,blockMiddleware,userDetailEditVerify)

router.post('/profile/editProfile',requireJWTAuthentication,blockMiddleware,userDetailEdit)

router.get('/generate-invoice/:orderId',requireJWTAuthentication,usergetOrderInvoice)

//HERE CHECK GET OR POST
router.get('/profile/change-password',requireJWTAuthentication,blockMiddleware,changePassword)

router.post('/cancel-order/:orderId',cancelOrder)

router.get('/get-orders',requireJWTAuthentication,userOrderDetails)




router.get('/orderDetails/:orderId',requireJWTAuthentication,blockMiddleware,orderDetails)

router.post('/order-ratings',requireJWTAuthentication,blockMiddleware,orderRatings);

router.post('/order-review',requireJWTAuthentication,blockMiddleware,orderReview)

router.delete('/delete-review/:reviewId',requireJWTAuthentication,deleteReview)

router.post('/return-order',requireJWTAuthentication,returnOrder)



//WISHLIST
router.post('/wishlist/:productId',requireJWTAuthentication,blockMiddleware,cartController.WishlistAdd)

router.get('/wishlist',requireJWTAuthentication,blockMiddleware,cartController.WishlistGet)

router.post('/wishlist/remove/:productId',requireJWTAuthentication,blockMiddleware,cartController.wishlistItemDelete)

router.post('/wishlist/moveTocart/:productId',requireJWTAuthentication,blockMiddleware,cartController.WishlistToCart)



router.post('/referrals',requireJWTAuthentication,blockMiddleware,userReferral)

router.get('/refer',requireJWTAuthentication,createuserReferral)
//Wallet Route

router.post('/create-razorpay-order',requireJWTAuthentication,WalletController.WalletRazorpayCreation)

router.post('/confirm-payment',requireJWTAuthentication,WalletController.WalletConfirmPayment)

router.post('/withdraw',requireJWTAuthentication,WalletController.withdrawMoney)



//Testing for JWT
router.get('/protected',requireJWTAuthentication,
(req,res)=>{
     res.status(200).json({sucess:true,msg:'You are sucessfully to this route'})
})

router.post('/logout',userLogout);



module.exports = router;
