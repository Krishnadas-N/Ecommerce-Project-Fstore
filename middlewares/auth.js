const passport = require('passport');

exports.requireJWTAuthentication = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
         if (err) {
           // Handle error (e.g., log it)
           return next(err);
         }
     
         if (!user) {
          if (req.url.startsWith('/addToCart/')) {
            console.log(req.url)
            console.log("here calledreq.url.startsWith('/api/home/cart/addToCart/') ")
            // Authentication failure in an API route, return a JSON response
            return res.status(401).json({ status:401, message: 'Authentication failed. Please login to continue.' });
          }else if(req.url.startsWith('/wishlist/')){
            console.log("here calledreq.url.startsWith('/api/home/wishlist/') ")
            return res.status(401).json({ status:401,message: 'Authentication failed. Please login to continue.' });
          }
           else {
            console.log(req.url)
            console.log("redirected to login page")
            // Authentication failure on a regular web page, redirect to the login page
            return res.redirect('/login'); // Replace with your login page
          }
        }
      
     
         // User is authenticated, continue to the next middleware
         req.user = {
              _id:user._id,
              firstName:user.firstName,
              lastName:user. lastName,
              email:user.email
         }
         console.log(req.user)
         next();
       })(req, res, next);
     }



     exports.loggingOrNot = (req, res, next) => {
      passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (user) {
          console.log("user Exists in jwt")
          return res.redirect('/');
        } else {
          console.log("USer is not exxist in jwt")
          next();
        }
      })(req, res, next);
    }
    
exports.CommonRouteAuthentication = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      // Handle error (e.g., log it)
      return next(err);
    }

    if (user) {
      // User is authenticated, set the user information on the request object
      req.user = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };
    }

    // Continue to the next middleware regardless of whether the user is authenticated
    next();
  })(req, res, next);
};






















// const jwt = require('jsonwebtoken');

// const User = require('../models/userModel');

// require('dotenv').config();

// const auth = async(req,res,next) =>{
//     try{
//         const token = req.header('Authorization').replace('Bearer ','');
//         const decoded = jwt.verify(token,process.env.JWT_SECRET);
//         const user = await User.findOne({ _id: decoded._id, 'tokens.token':token });

//         if(!user){
//             throw new Error;
//         }
//         req.token = token;
//         req.user = user;
//         next();
//     }catch(error){
//         res.status(401).send({error: "Authentication required"})
//     }
// }

// module.exports =auth;