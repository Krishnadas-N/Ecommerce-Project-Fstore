const express = require('express');

const cartRouter = express.Router();
require('dotenv').config();
// const Auth = require('../middlewares/auth')
const cartController = require('../controllers/cartController')

const { requireJWTAuthentication} =  require('../middlewares/auth')

const blockMiddleware = require('../middlewares/checkBlocked');




cartRouter.get('/',requireJWTAuthentication,blockMiddleware,cartController.cartGet);


cartRouter.post('/addToCart/:productId',requireJWTAuthentication,blockMiddleware,cartController.cartAdd);

cartRouter.put('/update-cart-quantity/:productId',requireJWTAuthentication,blockMiddleware,cartController.cartPut)

cartRouter.delete('/remove-product/:productId',requireJWTAuthentication,blockMiddleware,cartController.cartRemove)

cartRouter.patch('/update-cart-total',requireJWTAuthentication,blockMiddleware,cartController.cartbillTotalUpdate)

function nocache(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
}



cartRouter.get('/checkout',requireJWTAuthentication,blockMiddleware,nocache,cartController.checkoutGet);



cartRouter.post('/checkout',requireJWTAuthentication,blockMiddleware,nocache,cartController.checkoutPost);

cartRouter.post('/verify-payment',requireJWTAuthentication,blockMiddleware,cartController.razorpayVerify)

cartRouter.get('/payment-failed',requireJWTAuthentication,blockMiddleware,cartController.razorpayFailed)


cartRouter.post('/update-payment-status',requireJWTAuthentication,blockMiddleware,nocache,cartController.updatePaymentStatus)

cartRouter.get('/order-confirmation/:orderId',requireJWTAuthentication,blockMiddleware,nocache,cartController.orderConfirmation)





//COUPON MANAGEMENT

cartRouter.get('/getCoupons',requireJWTAuthentication,blockMiddleware,cartController.getCoupons);

cartRouter.get('/applyCoupon',requireJWTAuthentication,blockMiddleware,cartController.applyCoupon)


















module.exports = cartRouter;



