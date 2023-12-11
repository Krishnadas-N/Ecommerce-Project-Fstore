const User = require('../models/userModel');
const Product  = require('../models/productModel');
const Category = require('../models/CategoryModel');
const Cart = require('../models/cartModel');
const AddressModel = require('../models/addressModel') 
const OrderModel = require('../models/OrderModel');
const mongoose = require('mongoose')
const razorpayInstance = require('../config/RazorPay');
const crypto = require('crypto')
const Wishlist = require('../models/wishlistModel')
require('dotenv').config();
const Wallet  = require('../models/WalletModel')
const { Coupon } = require('../models/couponModel')




exports.cartAdd  = async(req,res,next)=>{
    try{
        const productId = req.params.productId;

        const product  = await Product.findById(productId);
        if(!product){
            return res.status(404).json({success: false,message:'Product Not Found'})
        }
        if (product.quantity === 0) {
            return res.status(400).json({ success: false, message: 'Product is out of stock' });
        }
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({success: false ,message:'user is not found'})
        }
       
        let cart = await Cart.findOne({owner:userId});

        if(!cart){
            cart = new Cart({
                owner : userId,
                items:[],
                billTotal:0
            })
        }

        const cartItem = cart.items.find((item)=>item.productId.toString() === productId)

        if(cartItem){
          if (cartItem.quantity + 1 > product.countInStock) {
            return res.status(400).json({ success: false, message: 'Insufficient stock quantity' });
        }

            cartItem.productPrice=product.price;
            cartItem.quantity+=1;
            cartItem.price = cartItem.quantity * product.price;
        }else{
            cart.items.push({
                productId:productId,
                name:product.name,
                image:product.image,
                productPrice:product.price,
                quantity:1,
                price:product.price
            })
        }

        cart.billTotal = cart.items.reduce((total,item)=>total + item.price,0)
        await cart.save();

        res.status(200).json({success: true,message:'Item added to cart'})

    }catch(err){
        console.log(err);
        res.status(500).json({success: false, message: 'Internal server error' });
  
    }
}


exports.cartGet = async(req,res,next)=>{
    try{
        
      let UserExist = false;
  if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
    UserExist = true;
  }
        const userId = req.user._id;
        const category = await Category.find();
        const cart = await Cart.findOne({owner:userId}).populate({
          path: 'items.productId',
          model: 'Product'
      });
        console.log(cart,"111111111111111111");
    
        // const cartCount = cart.items.length;
       
      return  res.render('cart',{category,cart:cart,UserExist:UserExist})
   
    } catch(error){
      console.error(error);
      console.log(error);
      next(error);
    }
}

exports.CartPost = async(req,res,next)=>{
    try{

    }catch(err){
        console.log(err);
    }
}   

exports.cartPut  = async(req,res,next)=>{
    try{
        const producdId=  req.params.productId;
        const newQuantity = req.body.quantity;

         // Find the user's cart based on their user ID (you may use cookies or sessions)
         const userId = req.user._id;
         const cart = await Cart.findOne({ owner: userId });
 
         if (!cart) {
             return res.status(404).json({ success: false, message: 'Cart not found' });
         }

         const cartItem = cart.items.find((item) => item.productId.toString() === producdId);

         
        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }
        const product = await Product.findById(producdId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (newQuantity > product.countInStock) {
            return res.status(400).json({ success: false, message: 'Quantity exceeds Currently Out of  stock' });
        }

        cartItem.quantity = newQuantity;
        cartItem.price = newQuantity * cartItem.productPrice;

          // Recalculate the cart's billTotal based on selected items
          let total = 0;
          cart.items.forEach((item) => {
              if (item.selected) {
                  total += item.productPrice * item.quantity;
              }
          });
  
          cart.billTotal = total;
        // Recalculate the cart's billTotal
        // cart.billTotal = cart.items.reduce((total, item) => total + item.price, 0);

        await cart.save(); // Save the updated cart

        return res.status(200).json({ success: true, message: 'Quantity updated successfully' ,Stock:product.countInStock});

    }catch(err){
        console.log(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

exports.cartRemove = async(req,res,next)=>{
    try{
        const productId = req.params.productId;
        const userId = req.user._id;

        const cart = await Cart.findOne({owner:userId});

        if(!cart){
            return res.status(404).json({success:false,message:'Cart Not Found'})
        }

        const productIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
       
        if(productIndex === -1){
            return res.status(404).json({success:false,message:'Product not found'})
        }

        // / Check if the removed item was selected and adjust the billTotal
        if (cart.items[productIndex].selected) {
            cart.billTotal -= cart.items[productIndex].price;
        }


        cart.items.splice(productIndex,1);

        await cart.save();
        return res.status(200).json({ success: true, message: 'Product removed from the cart' });

    }catch(err){
        console.log(err);
        res.status(500).json({ success: false, message: 'Internal server error' });

    }
}

exports.cartbillTotalUpdate = async(req,res,next)=>{
    try{
        const selectedProductIds = req.body.selectedProductIds;
    

        // Find the user's cart
        const userId = req.user._id;
        const cart = await Cart.findOne({ owner: userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart is not found based on user' });
        }

        // if(!selectedProducts){
        //     return res.status(404).json({success:false,message:'Selected products not found'})
        // }


         // Set 'selected' to true for all selected products
         cart.items.forEach((item) => {
            if (selectedProductIds.includes(item.productId.toString())) {
                item.selected = true;
            } else {
                item.selected = false; // Unselect other products
            }
        });


        let total = 0;
       cart.items.forEach((item) => {
            if (item.selected) {
                total += item.productPrice * item.quantity;
            }
        });
          // Update the cart's billTotal
          cart.billTotal = total;
          await cart.save();

         res.status(200).json({success:true,message:'Successfully billtotal updated', billTotal: cart.billTotal });

    }catch(err){
        console.log(err);
        next(err)
    }
}


exports.checkoutGet = async (req,res,next)=>{
    try{
      
      let Adreessmessage;
      if(req.session.Adreess!=''){
        Adreessmessage = req.session.Adreess;
        req.session.Adreess=''
      }

      let UserExist = false;
  if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
    UserExist = true;
  }
        
        const addresses = await AddressModel.findOne({user:req.user._id})
        const [userDetails] = await User.aggregate([
          {
            $match:{
              _id : new mongoose.Types.ObjectId(req.user._id),
              
            }
          },{
            $lookup:{
              from:'wallets',
              localField:"wallet",
              foreignField:"_id",
              as:"WalletData"
            }
          },
          {
            $limit: 1,
          },

        ])

        // / Check if WalletDetails is not an empty array
      if (userDetails.WalletData.length === 0) {
        userDetails.WalletData = null; // Set it to null or an empty object, depending on your preference
      } else {
        // Unwind only if there are WalletDetails
        userDetails.WalletData = userDetails.WalletData[0];
      }

              console.log(userDetails)
          // ({_id:req.user._id})
        const category = await Category.find();
        const cartCheckout = await Cart.findOne({owner:req.user._id});
        const selectedItems = cartCheckout.items.filter(item => item.selected === true);
         // Get selected address types based on the user's addresses
         let selectedAddressTypes = []; // Initialize selectedAddressTypes as an empty array

         if (addresses) {
             selectedAddressTypes = addresses.addresses.map((address) => address.addressType);
         }
         // Calculate the total amount for the order
         const billTotal = selectedItems.reduce((total, item) => total + item.price, 0);
         let discountPrice = null;
         let discountedTotal = null
         if(req.session.discountAmount && req.session.discountedTotal){
          discountPrice = req.session.discountAmount;
          discountedTotal = req.session.discountedTotal
         }
         // Get the count of selected items
         const itemCount = selectedItems.length;
         console.log(billTotal +'/////////')
        res.render('Checkout',{UserExist:UserExist,
          userDetails,
           category, 
           addresses,
            selectedItems,
             billTotal,
             itemCount,
             Adreessmessage,
             discountPrice,
             discountedTotal,
             selectedAddressTypes})

    } catch(error){
      console.error(error);
      console.log(error);
      next(error);
    }
}

// OrderModel
function generateRandomOrderId(length) {
  let result = '';
  const characters = '0123456789'; // Digits

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return 'OD_' + result;
}



exports.checkoutPost = async (req, res, next) => {
  try {
    // Validate the request body
    if (!req.body.paymentOption || !req.body.addressType) {
      
      // Handle invalid or missing data in the request
      return res
        .status(400)
        .json({ success: false, error: "Invalid data in the request" });
    }

    console.log(req.body.paymentOption, req.body.addressType,"22222222222222222222");

    const cart = await Cart.findOne({ owner: req.user._id });

    if (!cart || cart.items.length === 0) {
      // Handle the case where the user has no items in the cart
      return res
        .status(400)
        .json({ success: false, error: "No items in the cart" });
    }

    let selectedItems = cart.items.filter((item) => item.selected === true);

    // Check if any selected items have already been ordered
    const orderedItems = await OrderModel.find({
      user: req.user._id,
      items: {
        $elemMatch: {
          productId: { $in: selectedItems.map((item) => item.productId) },
        },
      },
    });

    if (orderedItems.length > 0) {
      selectedItems = selectedItems.filter(
        (item) =>
          !orderedItems.some((orderedItem) =>
            orderedItem.items.some(
              (orderedItemItem) => orderedItemItem.productId === item.productId
            )
          )
      );
    }

    const Address = await AddressModel.findOne({ user: req.user._id });

    if (!Address) {
      // Handle the case where the user has no address
      return res
        .status(400)
        .json({ success: false, error: "User has no address" });
    }
    console.log("Address" + Address);
    const deliveryAddress = Address.addresses.find(
      (item) => item.addressType === req.body.addressType
    );

    if (!deliveryAddress) {
      // Handle the case where the requested address type was not found
      return res
        .status(400)
        .json({ success: false, error: "Address not found" });
    }
    const orderAddress = {
      addressType: deliveryAddress.addressType,
      HouseNo: deliveryAddress.HouseNo,
      Street: deliveryAddress.Street,
      Landmark: deliveryAddress.Landmark,
      pincode: deliveryAddress.pincode,
      city: deliveryAddress.city,
      district: deliveryAddress.district,
      State: deliveryAddress.State,
      Country: deliveryAddress.Country,
    };

    let billTotal = selectedItems.reduce(
      (total, item) => total + item.price,
      0
    )
    

    console.log(billTotal, selectedItems);

   


          if (req.body.paymentOption === "cashOnDelivery") {

            console.log('billTotal'+billTotal)
            if(  req.session && req.session.discountedTotal && req.session.discountAmount && req.session.discountAmount!=null &&  req.session.discountedTotal!=null){
              billTotal = req.session.discountedTotal
            
              const coupon = await Coupon.findOne({ code: req.session.couponCode });
              coupon.usersUsed.push(req.user._id);
              await coupon.save();
              req.session.couponId = coupon._id;
             
            }
            console.log('billTotal'+billTotal)
            const orderIds = await generateRandomOrderId(6); 
          // Create a new order
                      const orderData  = new OrderModel({
                      user: req.user._id,
                      cart: cart._id,
                      items: selectedItems,
                      billTotal,
                      paymentStatus: "Success",
                      orderId: orderIds,
                      paymentId: null,
                      paymentMethod: req.body.paymentOption,
                      deliveryAddress: orderAddress,
                      discounts : req.session.discountedTotal ? [
                        {
                          code:req.session.couponCode,
                         amount:req.session.discountAmount,
                         discountType:'Coupon',
                         coupon:req.session.couponId?req.session.couponId: null,
                        }
                       ]:[]
                      // Add more order details as needed
                      });

                      for (const item of selectedItems) {
                        const product = await Product.findOne({ _id: item.productId });
                        if (product) {
                          // Ensure that the requested quantity is available in stock
                          if (product.countInStock >= item.quantity) {
                            // Decrease the countInStock by the purchased quantity
                            product.countInStock -= item.quantity;
                            await product.save();
                          } else {
                            // Handle the case where the requested quantity is not available
                            return res
                              .status(400)
                              .json({ success: false, error: "Not enough stock for some items" });
                          }
                        } else {
                          // Handle the case where the product was not found
                          return res
                            .status(400)
                            .json({ success: false, error: "Product not found" });
                        }
                      }
                      
                      const order = new OrderModel(orderData)
                      await order.save()
                        req.session.couponCode= null
                        req.session.discountAmount = null
                        req.session.discountedTotal =null
                        req.session.couponId=null
                   


                      // Remove selected items from the cart
                      cart.items = cart.items.filter((item) => !item.selected);
                      cart.billTotal = 0;
                      await cart.save();

                      // Get the order ID after saving it
                      const orderId = order._id;
                        // Deduct purchased items from inventory
                    
                      return res.status(201).json({success:true,message:'Cash on Delivery Sucess',orderId})
                      
        } else if (req.body.paymentOption === "Razorpay") {

          for (const item of selectedItems) {
            const product = await Product.findOne({ _id: item.productId });
            if (product) {
              // Ensure that the requested quantity is available in stock
              if (product.countInStock >= item.quantity) {
                // Decrease the countInStock by the purchased quantity
                product.countInStock -= item.quantity;
                await product.save();
              } else {
                // Handle the case where the requested quantity is not available
                return res
                  .status(400)
                  .json({ success: false, error: "Not enough stock for some items" });
              }
            } else {
              // Handle the case where the product was not found
              return res
                .status(400)
                .json({ success: false, error: "Product not found" });
            }
          }
              // Handle Razorpay
              if(req.session.discountedTotal && req.session.discountAmount && req.session.discountAmount!=null &&  req.session.discountedTotal!=null){
                billTotal = req.session.discountedTotal
              
                const coupon = await Coupon.findOne({ code: req.session.couponCode });
                coupon.usersUsed.push(req.user._id);
                await coupon.save();
                req.session.couponId = coupon._id;
               
              }

              const amount = billTotal * 100; // Convert to paise or cents
              console.log('billTotal'+billTotal)
            
              const orderData  = {
                  user: req.user._id,
                  cart: cart._id,
                  items: selectedItems,
                  billTotal,
                  paymentStatus: "Pending",
                  orderId:null,
                  paymentId: null,
                  paymentMethod: req.body.paymentOption,
                  deliveryAddress: orderAddress,
                  discounts : req.session.discountedTotal ? [
                   {
                    code:req.session.couponCode,
                    amount:req.session.discountAmount,
                    discountType:'Coupon',
                    coupon:req.session.couponId?req.session.couponId: null,
                   }
                  ]:[]
                  // Add more order details as needed
                };
               
              // Create a new order
              const order = new OrderModel(orderData);
            
             
              // const orderId = order._id;
        
              // Create a Razorpay order and send the order details to the client
              const options = {
                amount,
                currency: 'INR',
                receipt: 'razorUser@gmail.com', // Replace with your email
              };
        
              razorpayInstance.orders.create(options,async (err, razorpayOrder) => {
                if (!err) {
                  order.orderId = razorpayOrder.id;
          
                  try {
                    await order.save(); // Save the order to the database

                    req.session.couponCode= null
                    req.session.discountAmount = null
                    req.session.discountedTotal =null
                    req.session.couponId=null

                    console.log("/.....................................");
                    console.log(order)
                    return res.status(200).json({
                      success: true,
                      msg: 'Order Created',
                      order,
                      amount,
                      key_id: process.env.RAZORPAY_KEYID,
                      contact: req.user.mobile, // Replace with user's mobile number
                      name: req.user.firstName + ' ' + req.user.lastName,
                      email: req.user.email,
                      address: `${orderAddress.addressType}\n${orderAddress.HouseNo} ${orderAddress.Street}\n${orderAddress.pincode} ${orderAddress.city} ${orderAddress.district}\n${orderAddress.State}`,
                    });
                  } catch (saveError) {
                    console.error('Error saving order to the database:', saveError);
                    return res.status(400).json({ success: false, msg: 'Failed to save order' });
                  }
                } else {
                  console.error('Error creating Razorpay order:', err);
                  return res.status(400).json({ success: false, msg: 'Something went wrong!' });
                }
              });
        }
        else if(req.body.paymentOption === "Wallet"){

          const wallet = await Wallet.findOne({ user:  req.user._id });

          if (!wallet) {
            return res.status(404).json({ success: false, msg: 'Wallet not found for the user' });
          }
           // Handle Razorpay
           for (const item of selectedItems) {
            const product = await Product.findOne({ _id: item.productId });
            if (product) {
              // Ensure that the requested quantity is available in stock
              if (product.countInStock >= item.quantity) {
                // Decrease the countInStock by the purchased quantity
                product.countInStock -= item.quantity;
                await product.save();
              } else {
                // Handle the case where the requested quantity is not available
                return res
                  .status(400)
                  .json({ success: false, error: "Not enough stock for some items" });
              }
            } else {
              // Handle the case where the product was not found
              return res
                .status(400)
                .json({ success: false, error: "Product not found" });
            }
          }
           if(req.session.discountedTotal && req.session.discountAmount && req.session.discountAmount!=null &&  req.session.discountedTotal!=null){
            billTotal = req.session.discountedTotal
          
            const coupon = await Coupon.findOne({ code: req.session.couponCode });
            coupon.usersUsed.push(req.user._id);
            await coupon.save();
            req.session.couponId = coupon._id;
           
          }

          // Check if the wallet balance is sufficient
          if (wallet.balance < billTotal) {
            return res.status(400).json({ success: false, msg: 'Insufficient funds in the wallet' });
          }
          // Deduct the billTotal from the wallet balance
          wallet.balance -= billTotal;

          
            // Create a transaction entry for the order
            wallet.transactions.push({
              amount: -billTotal,
              type: 'debit',
              description:'Purchase'
            });

            // Deduct purchased items from inventory
            for (const item of selectedItems) {
              const product = await Product.findOne({ _id: item.productId });
              if (product) {
                // Ensure that the requested quantity is available in stock
                if (product.countInStock >= item.quantity) {
                  // Decrease the countInStock by the purchased quantity
                  product.countInStock -= item.quantity;
                  await product.save();
                } else {
                  // Handle the case where the requested quantity is not available
                  return res
                    .status(400)
                    .json({ success: false, error: "Not enough stock for some items" });
                }
              } else {
                // Handle the case where the product was not found
                return res
                  .status(400)
                  .json({ success: false, error: "Product not found" });
              }
            }
            // Save the wallet changes
            await wallet.save();

                const orderIds = await generateRandomOrderId(6); 
                const orderData  = {
                  user: req.user._id,
                  cart: cart._id,
                  items: selectedItems,
                  billTotal,
                  paymentStatus: "Success",
                  orderId: orderIds,
                  paymentId: null,
                  paymentMethod: req.body.paymentOption,
                  deliveryAddress: orderAddress,
                  discounts : req.session.discountedTotal ? [
                    {
                     code:req.session.couponCode,
                     amount:req.session.discountAmount,
                     discountType:'Coupon',
                     coupon:req.session.couponId?req.session.couponId: null,
                    }
                   ]:[]
                  // Add more order details as needed
                  };

                  const order = new OrderModel(orderData)
                  await order.save()
                    req.session.couponCode= null
                    req.session.discountAmount = null
                    req.session.discountedTotal =null
                    req.session.couponId=null
               


                  // Remove selected items from the cart
                  cart.items = cart.items.filter((item) => !item.selected);
                  cart.billTotal = 0;
                  await cart.save();

                  const orderId = order._id;

                  
            return res.status(201).json({success:true,message:'Cash on Delivery Sucess',orderId})

        }
        else {
          // Handle other payment methods (e.g., Paypal)
          // You can add the implementation for other payment methods here
          return res.status(400).json({ success: false, error: 'Invalid payment option' });
        }
      
    // return res
    //   .status(201)
    //   .json({ success: true, message: "order placed successfully", orderId }); // Redirect to a confirmation page
  } catch (err) {
    console.error(err);
    next(err);
  }
};
  

exports.razorpayVerify = async (req, res,next) => {
  try {
    console.log("VERIFY EYE/////////////////////////////");
    const body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    console.log(body);
    
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEYSECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === req.body.razorpay_signature) {
      console.log("Corrected Verify");

      // Find the previously stored record using orderId
      const updatedOrder = await OrderModel.findOneAndUpdate(
        { orderId: req.body.razorpay_order_id },
        {
          paymentId: req.body.razorpay_payment_id,
          signature: req.body.razorpay_signature,
          paymentStatus: "Success",
        },
        { new: true }
      );
        console.log(updatedOrder)
      if (updatedOrder) {
        const cart = await Cart.findOne({ owner: req.user._id });
        let selectedItems = cart.items.filter((item) => item.selected === true);

        // Deduct purchased items from inventory
            for (const item of selectedItems) {
              const product = await Product.findOne({ _id: item.productId });
              if (product) {
                // Ensure that the requested quantity is available in stock
                if (product.countInStock >= item.quantity) {
                  // Decrease the countInStock by the purchased quantity
                  product.countInStock -= item.quantity;
                  await product.save();
                } else {
                  // Handle the case where the requested quantity is not available
                  return res
                    .status(400)
                    .json({ success: false, error: "Not enough stock for some items" });
                }
              } else {
                // Handle the case where the product was not found
                return res
                  .status(400)
                  .json({ success: false, error: "Product not found" });
              }
            }
        
        // Remove selected items from the cart
        cart.items = cart.items.filter((item) => !item.selected);
        cart.billTotal = 0;
        await cart.save();
        // Render the payment success page
        return res.json({success:true,message:'Order Sucessfully',updatedOrder})
      } else {
        // Handle the case where the order couldn't be updated
        return res.json({
          success:false,
          message:'Order Failed Please try Again'
        })
      }
    } else {
      // Handle the case where the signature does not match
      return res.json({
        success:false,
        message:'Order Failed Please try Again'
      })
    }
  } catch (err) {
    console.log(err);
    // Handle errors
    return res.render('paymentFailed', {
      title: "Error",
      error: "An error occurred during payment verification",
    });
  }
};



exports.razorpayFailed = async (req, res) => {
  try {
    console.log("PAYMENT FAILED ===========================================================>");
    const orderId = req.query.orderId;
    console.log(orderId);

    // Check if orderId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.error('Invalid orderId');
      return res.render('errorHandler'); // or handle the error appropriately
    }

    // Use findByIdAndDelete to find and delete the order
    const order = await OrderModel.findById(orderId);

    console.log(order)
    if (!order) {
      console.warn(`No order with id ${orderId} was found`);
      return res.render('errorHandler'); // or handle the error appropriately
    }
     // Check if the order is pending
     if (order.status === 'Pending' && order.paymentStatus === 'Pending') {
      if (order.discounts && order.discounts.length > 0) {
        const coupon = await Coupon.findById(order.discounts[0].coupon);
        if (coupon) {
          // Remove the user from the usersUsed array
          coupon.usersUsed = coupon.usersUsed.filter(userId => userId.toString() !== order.user.toString());
          await coupon.save();
        }
      }
      order.discounts = [];
      // Update the order status and payment status to "Failed"
      order.status = 'Failed';
      order.paymentStatus = 'Failed';

      // Save the updated order
      await order.save();

      // Log a success message
      console.log('Order status and payment status updated to "Failed" successfully');

      // Render the paymentFailed page after successful update
      console.log("Payment failed and order status updated successfully");
      return res.status(200).render('paymentFailed');
    } else {
      console.warn(`Order with id ${orderId} is not in pending status`);
      return res.render('errorHandler'); // or handle the error appropriately
    }

  } catch (err) {
    console.error('An unexpected error occurred:', err);
    res.render('errorHandler'); // or handle the error appropriately
  }
};


exports.updatePaymentStatus = async(req,res,next)=>{
    try{
        const orderId = req.body.orderId;
    
        // Update the payment status in the database (e.g., using Mongoose)
        const updatedOrder = await OrderModel.findByIdAndUpdate(
          orderId,
          { paymentStatus: 'Success' },
          { new: true }
        );
    
        if (updatedOrder) {
          return res.status(200).json({ success: true, message: 'Payment status updated successfully' });
        } else {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
      
    }
}


exports.orderConfirmation = async(req,res,next)=>{
    const orderId = req.params.orderId;
      // Validate if orderId is a valid ObjectId
     if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(404).render('errorHandler');
     }

    try{
        
        let orderDetails=await OrderModel.findById(orderId)
        if(!orderDetails){
            return res.status(404).render('errorHandler');
        }
        
        res.render('orderConfirmation')
    } catch(error){
      console.error(error);
      console.log(error);
      next(error);
    }
}



//WishLIST SETUP
exports.WishlistAdd = async (req, res) => {
  try {
  console.log("haui")
    const productId = req.params.productId;
    const userId = req.user._id;

    // Find the product by its ID
    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({ message: 'The Product is Not Found' });
    }

    // Check if the product is already in the user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      // If the wishlist doesn't exist for the user, create a new one
      const newWishlist = new Wishlist({
        user: userId,
        products: [productId],
      });
      await newWishlist.save();
      res.status(200).json({ message: 'Product added to wishlist successfully' });
    } else {
      // Check if the product is already in the wishlist
      const productIndex = wishlist.products.indexOf(productId);

      if (productIndex !== -1) {
        // If the product is in the wishlist, remove it
        wishlist.products.splice(productIndex, 1);
        await wishlist.save();
        res.status(200).json({ message: 'Product removed from wishlist successfully' });
      } else {
        // If the product is not in the wishlist, add it
        wishlist.products.push(productId);
        await wishlist.save();
        res.status(200).json({ message: 'Product added to wishlist successfully' });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



exports.WishlistGet = async(req,res,next)=>{
  try{
    
      let UserExist = false;
  if (req.cookies?.userloggedIn && req.cookies?.userloggedIn!=undefined) {
    UserExist = true;
  }
  const page = parseInt(req.query.page) || 1; // Get the requested page number
  const perPage = 8 ; // Number of items per page

    const userId = req.user._id;
    const category = await Category.find();
    const totalWishlistItems = await Wishlist.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $project: {
          numberOfWishlistItems: { $size: '$products' },
        },
      },
    ]);
    
    // Extract the count from the result
    const countResult = totalWishlistItems[0];
    const numberOfItemsInWishlist = countResult ? countResult.numberOfWishlistItems : 0;
    
    console.log(totalWishlistItems);
    const totalPages = Math.ceil(numberOfItemsInWishlist / perPage);
    console.log(totalPages)

    // Calculate the starting index for pagination
    const startIndex = (page - 1) * perPage;

    const Products = await Wishlist.aggregate([
      {
        $match:{
        user: userId,
        }
      }
      ,{
        $unwind:'$products'
      },
      {
        $lookup:{
          from:"products",
          localField:"products",
          foreignField:"_id",
          as:"items"
          }
          },
          {
            $unwind:"$items"
          },
          {
            $project:{
              _id:1,
              "productId":"$items._id",
              "name":"$items.name",
              "price":"$items.price",
              "description":"$items.description",
              "image":"$items.image",
              "categoryName":"$items.categories.name",
              "quantity":"$items.countInStock"
              }
      }
    ]) .skip(startIndex)
    .limit(perPage);

    console.log(Products)

    const paginationInfo = {
      totalPages,
      currentPage: page,
    };

    return  res.render('wishlist',{category,Products,UserExist:UserExist,paginationInfo})
 
  }
  catch(error){
    console.error(error);
    console.log(error);
    next(error);
  }
}


exports.wishlistItemDelete = async (req, res) => {
  try {
    const productId = req.params.productId; // The product ID to remove from the wishlist
    const userId = req.user._id; // The user ID
    console.log("wislist Delete")
    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    console.log(wishlist)
    if (!wishlist) {
      console.log("not Wishlais")
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Check if the product exists in the wishlist
    const productIndex = wishlist.products.indexOf(productId);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in the wishlist' });
    }

    // Remove the product from the wishlist
    wishlist.products.splice(productIndex, 1);

    // Save the updated wishlist
    await wishlist.save();

    res.status(200).json({ message: 'Product removed from the wishlist' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



exports.WishlistToCart = async (req, res) => {
  try {
    console.log("move to cart")
    const userId = req.user._id; // Assuming you have the user ID available

    // Get the product ID you want to move from the request
    const productId = req.params.productId; // Adjust this based on your route

    // Retrieve the product details from the wishlist
    const wishlistItem = await Wishlist.findOne({ user: userId, products: productId });

    if (!wishlistItem) {
      console.log("Product not found in the wishlist")
      return res.status(404).json({ message: 'Product not found in the wishlist' });
    }

    // Check if the product is available in your product collection
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.quantity === 0) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }

    // Create or retrieve the user's cart
    let cart = await Cart.findOne({ owner: userId });
    
    if (!cart) {
      // If the cart doesn't exist, create a new one
      cart = new Cart({ owner: userId, items: [], billTotal: 0 });
    }

    const cartItem = cart.items.find((item)=>item.productId.toString() === productId)
    
    if(cartItem){
      cartItem.productPrice=product.price;
      cartItem.quantity+=1;
      cartItem.price = cartItem.quantity * product.price;
  }else{
      cart.items.push({
          productId:productId,
          name:product.name,
          image:product.image,
          productPrice:product.price,
          quantity:1,
          price:product.price
      })
  }

    // Update the cart's bill total
    cart.billTotal = cart.items.reduce((total, item) => total + item.price, 0);

    // Save the cart
    await cart.save();

    // Remove the product from the wishlist
    await Wishlist.updateOne(
      { user: userId },
      { $pull: { products: productId } }
    );

    return res.status(200).json({ message: 'Product moved from wishlist to cart successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to retrieve and filter coupons based on the bill total
const getCouponsForBill = async (billTotal) => {
  try {
    const currentDate = new Date();
    console.log(billTotal+'/,/,/,/,/.,.,/cxxxxxxxxxxxxxxxxxxxxxxxx,')
    // Find active coupons that match the bill total criteria
    const availableCoupons = await Coupon.find({
      isActive: true,
      minimumAmount: { $lte: billTotal }, // Check if the bill total is greater than or equal to the minimumAmount
      expirationDate: { $gte: currentDate },
    });
    console.log(availableCoupons)
    return availableCoupons;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
};

exports.getCoupons = async(req,res,next)=>{
  try{
    const billTotal = parseFloat(req.query.billTotal); // Get bill total from the request query
    const coupons = await getCouponsForBill(billTotal);
    res.json(coupons);
  }catch(err){
    console.log(err);
    return res.status(500).json({message:"Internal server error"});
  }
}



// Define a function to check if a coupon is valid
function isValidCoupon(coupon) {
  const currentDate = new Date();

  // Check if the coupon is active
  if (!coupon.isActive) {
    return false;
  }

  // Check if the coupon has not expired
  if (coupon.expirationDate < currentDate) {
    return false;
  }

  if (coupon.maxUsers !== null && coupon.usersUsed.length >= coupon.maxUsers ) {
    return false;
  }
  // You can add more criteria here based on your requirements

  return true;
}

exports.applyCoupon = async (req, res) => {
  try {
    const couponCode = req.query.code; // Get the coupon code from the request
    const billTotal = parseFloat(req.query.billTotal); // Get the bill total from the request
    const userId = req.user._id;
    // Fetch the coupon from the database based on the coupon code
    const coupon = await Coupon.findOne({ code: couponCode });
    
    if (!coupon) {
      req.session.couponCode= null
      req.session.discountAmount = null
      req.session.discountedTotal =null
      // If the coupon is not found, return an error response
      return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }

    // Check if the coupon is valid (isActive, not expired, etc.)
    if (!isValidCoupon(coupon)) {
      req.session.couponCode=null
      req.session.discountAmount = null
      req.session.discountedTotal = null;
      return res.status(400).json({ success: false, message: 'Coupon is not valid' });
    }
    if (coupon.usersUsed.includes(userId)) {
      req.session.couponCode=null
      req.session.discountAmount = null
      req.session.discountedTotal = null;
      return res.status(400).json({ success: false, message: 'Coupon has already been used by this user' });
    }
    // Calculate the discount amount based on the discount percentage
    let discountAmount = parseInt((coupon.discountPercentage / 100) * billTotal);
    
    if(coupon.maxDiscountAmount !== null){
      discountAmount = Math.min(discountAmount,coupon.maxDiscountAmount)
    }
    console.log(discountAmount+'discountAmount')
    // Calculate the discounted total
    const discountedTotal = billTotal - discountAmount;

    // Store the discounted total in the session
    req.session.couponCode = couponCode;
    req.session.discountAmount =discountAmount;
    req.session.discountedTotal = discountedTotal;
    console.log(req.session.discountedTotal)
    // Return the result to the frontend
    return res.json({ success: true, discountedPrice:discountAmount,newTotalPrice:discountedTotal });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

  // Calculate discount based on percentage
  // let discountAmount = (coupon.discountPercentage / 100) * billTotal;

  // Cap the discount at the specified maximum amount
  // if (coupon.maxDiscountAmount !== null) {
  //     discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
  // }
  // if i have a doubt if i have created a coupon of 30 % discount and the coupon minimum amount is 500 and the the coupon discounted amount will be 2000 so if any amount bill total will be applied then the coupon discount amount not upto 2000 but i don't know how to implement that what we do the coupon discounted amount will greater than the allowed amount give a way to do this and also give code if you can 

